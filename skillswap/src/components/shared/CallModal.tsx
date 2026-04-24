import { useEffect, useRef, useState, useCallback } from "react"
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, PhoneIncoming } from "lucide-react"
import { socketService } from "@/services/socketService"
import { UserAvatar } from "@/components/shared/UserAvatar"

type CallType = "video" | "audio"
type CallState = "idle" | "calling" | "incoming" | "active" | "unavailable"

interface Participant {
  id: number
  name: string
  avatar?: string
}

interface CallModalProps {
  currentUserId: number
}

// Google STUN servers — free, no setup needed
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
}

let peerConnection: RTCPeerConnection | null = null

export function CallModal({ currentUserId }: CallModalProps) {
  const [callState, setCallState] = useState<CallState>("idle")
  const [callType, setCallType] = useState<CallType>("video")
  const [callId, setCallId] = useState("")
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null)
  const [unavailableReason, setUnavailableReason] = useState("")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Expose startCall globally so Messages/Sessions can trigger it
  useEffect(() => {
    (window as any).__startCall = (p: Participant, type: CallType) => startCall(p, type)
    return () => { delete (window as any).__startCall }
  })

  // Socket listeners
  useEffect(() => {
    const unsub1 = socketService.onIncomingCall((data) => {
      setCallId(data.callId)
      setCallType(data.callType)
      setParticipant({ id: data.callerId, name: data.callerName })
      setIncomingOffer(data.offer)
      setCallState("incoming")
    })

    const unsub2 = socketService.onCallAnswered(async (data) => {
      if (!peerConnection) return
      clearRingTimeout()
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
      setCallState("active")
      startTimer()
    })

    const unsub3 = socketService.onCallIceCandidate(async (data) => {
      try {
        if (peerConnection?.remoteDescription) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } catch {}
    })

    const unsub4 = socketService.onCallEnded(() => {
      hangup(false)
    })

    const unsub5 = socketService.onCallRejected(() => {
      clearRingTimeout()
      cleanup()
      setUnavailableReason(`${participant?.name ?? "User"} declined the call.`)
      setCallState("unavailable")
    })

    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5() }
  }, []) // eslint-disable-line

  const clearRingTimeout = () => {
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null }
  }

  const getLocalStream = async (type: CallType) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: type === "video",
      audio: true,
    })
    localStreamRef.current = stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    return stream
  }

  const createPeer = (stream: MediaStream, targetUserId: number, cId: string) => {
    peerConnection = new RTCPeerConnection(ICE_SERVERS)

    stream.getTracks().forEach(track => peerConnection!.addTrack(track, stream))

    peerConnection.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0]
      }
    }

    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        socketService.sendIceCandidate(targetUserId, e.candidate.toJSON(), cId)
      }
    }

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection?.connectionState === "disconnected" || peerConnection?.connectionState === "failed") {
        hangup(false)
      }
    }

    return peerConnection
  }

  const startCall = useCallback(async (p: Participant, type: CallType) => {
    // Check if user is online before calling
    const isOnline = socketService.isUserOnline?.(p.id)
    if (isOnline === false) {
      setParticipant(p)
      setCallType(type)
      setUnavailableReason(`${p.name} is currently offline.`)
      setCallState("unavailable")
      return
    }

    setParticipant(p)
    setCallType(type)
    setCallState("calling")

    const cId = `call_${currentUserId}_${p.id}_${Date.now()}`
    setCallId(cId)

    try {
      const stream = await getLocalStream(type)
      const pc = createPeer(stream, p.id, cId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socketService.sendCallOffer(p.id, offer, type, cId)

      // Auto-cancel after 20s if no answer
      ringTimeoutRef.current = setTimeout(() => {
        cleanup()
        socketService.endCall(p.id, cId)
        setUnavailableReason(`${p.name} didn't answer.`)
        setCallState("unavailable")
      }, 20000)
    } catch (err) {
      console.error("Call failed:", err)
      cleanup()
      setCallState("idle")
    }
  }, [currentUserId]) // eslint-disable-line

  const acceptCall = async () => {
    if (!incomingOffer || !participant) return

    try {
      const stream = await getLocalStream(callType)
      const pc = createPeer(stream, participant.id, callId)
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socketService.sendCallAnswer(participant.id, answer, callId)
      setCallState("active")
      startTimer()
    } catch (err) {
      console.error("Accept call failed:", err)
      cleanup()
      setCallState("idle")
    }
  }

  const hangup = (notify = true) => {
    clearRingTimeout()
    if (notify && participant) {
      socketService.endCall(participant.id, callId)
    }
    cleanup()
    setCallState("idle")
  }

  const rejectCall = () => {
    if (participant) socketService.rejectCall(participant.id, callId)
    cleanup()
    setCallState("idle")
  }

  const cleanup = () => {
    clearRingTimeout()
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    peerConnection?.close()
    peerConnection = null
    if (timerRef.current) clearInterval(timerRef.current)
    setCallDuration(0)
    setIsMuted(false)
    setIsVideoOff(false)
    setIncomingOffer(null)
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
  }

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setIsMuted(v => !v)
  }

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setIsVideoOff(v => !v)
  }

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  if (callState === "idle") return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">

        {/* ── Unavailable screen ── */}
        {callState === "unavailable" && (
          <div className="flex flex-col items-center gap-5 p-10">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <PhoneOff className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-base">{participant?.name}</p>
              <p className="text-gray-400 text-sm mt-1">{unavailableReason}</p>
            </div>
            <button
              onClick={() => { setCallState("idle"); setUnavailableReason("") }}
              className="mt-2 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* ── Incoming call screen ── */}
        {callState === "incoming" && (
          <div className="flex flex-col items-center gap-6 p-10">
            <div className="relative">
              <UserAvatar name={participant?.name ?? ""} avatar={participant?.avatar} size="lg" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">{participant?.name}</p>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1.5 mt-1">
                {callType === "video" ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                Incoming {callType} call...
              </p>
            </div>
            <div className="flex gap-8 mt-2">
              <button onClick={rejectCall} className="flex flex-col items-center gap-2">
                <span className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
                  <PhoneOff className="w-6 h-6 text-white" />
                </span>
                <span className="text-xs text-gray-400">Decline</span>
              </button>
              <button onClick={acceptCall} className="flex flex-col items-center gap-2">
                <span className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors animate-pulse">
                  <PhoneIncoming className="w-6 h-6 text-white" />
                </span>
                <span className="text-xs text-gray-400">Accept</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Calling / Active screen ── */}
        {(callState === "calling" || callState === "active") && (
          <div className="flex flex-col">
            {/* Video area */}
            <div className="relative bg-black" style={{ minHeight: callType === "video" ? 320 : 200 }}>
              {callType === "video" ? (
                <>
                  {/* Remote video (full) */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-80 object-cover"
                  />
                  {/* Local video (PiP) */}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute bottom-3 right-3 w-28 h-20 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                  />
                </>
              ) : (
                /* Audio call — show avatar */
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <UserAvatar name={participant?.name ?? ""} avatar={participant?.avatar} size="lg" />
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(i => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-green-400 animate-bounce"
                        style={{ height: 8 + (i % 3) * 8, animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status overlay */}
              <div className="absolute top-3 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                <p className="text-white font-semibold text-sm drop-shadow">{participant?.name}</p>
                <p className="text-gray-300 text-xs drop-shadow">
                  {callState === "calling" ? "Calling..." : formatDuration(callDuration)}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5 py-5 bg-gray-900">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"}`}
                  title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={() => hangup(true)}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                title="End call"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
