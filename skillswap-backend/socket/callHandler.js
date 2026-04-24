/**
 * WebRTC Call Signaling Handler
 * Relays offer/answer/ICE candidates between peers
 */
class CallHandler {
  constructor(io) {
    this.io = io
    // activeCalls: Map<callId, { callerId, calleeId, type, status }>
    this.activeCalls = new Map()
  }

  // Caller initiates a call
  onCallOffer(socket, data) {
    const { targetUserId, offer, callType, callId } = data
    console.log(`📞 Call offer: ${socket.userId} → ${targetUserId} [${callType}]`)

    this.activeCalls.set(callId, {
      callerId: socket.userId,
      calleeId: targetUserId,
      type: callType,
      status: 'ringing',
    })

    this.io.to(`user:${targetUserId}`).emit('call:incoming', {
      callId,
      callerId: socket.userId,
      callerName: socket.user?.name || 'Someone',
      callType,
      offer,
    })
  }

  // Callee accepts and sends answer
  onCallAnswer(socket, data) {
    const { callId, answer, targetUserId } = data
    const call = this.activeCalls.get(callId)
    if (call) call.status = 'active'

    console.log(`✅ Call answered: ${callId}`)
    this.io.to(`user:${targetUserId}`).emit('call:answered', { callId, answer })
  }

  // Either side sends ICE candidate
  onIceCandidate(socket, data) {
    const { callId, candidate, targetUserId } = data
    this.io.to(`user:${targetUserId}`).emit('call:ice-candidate', { callId, candidate })
  }

  // Either side ends the call
  onCallEnd(socket, data) {
    const { callId, targetUserId } = data
    console.log(`📵 Call ended: ${callId}`)
    this.activeCalls.delete(callId)
    this.io.to(`user:${targetUserId}`).emit('call:ended', { callId })
  }

  // Callee rejects the call
  onCallReject(socket, data) {
    const { callId, targetUserId } = data
    console.log(`❌ Call rejected: ${callId}`)
    this.activeCalls.delete(callId)
    this.io.to(`user:${targetUserId}`).emit('call:rejected', { callId })
  }
}

module.exports = CallHandler
