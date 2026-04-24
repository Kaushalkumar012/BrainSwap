import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Bot, Minimize2, Sparkles, GripHorizontal } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useAppStore } from "@/store/appStore"

interface ChatMessage {
  id: number
  role: "user" | "bot"
  text: string
  time: string
}

function getTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getBotReply(
  input: string,
  userName: string,
  skills: string[],
  matches: number,
  sessions: number
): string {
  const msg = input.toLowerCase().trim()

  // Greetings
  if (/^(hi|hello|hey|namaste|hii|helo|yo)\b/.test(msg)) {
    return `Namaste ${userName}! 🙏 Main BRAIN SWAP Assistant hoon. Aapki kaise madad kar sakta hoon?\n\nAap pooch sakte hain:\n• Matches kaise kaam karte hain?\n• Session kaise schedule karein?\n• Skills kaise add karein?\n• Ratings ke baare mein`
  }

  // Who are you
  if (/who are you|kaun ho|what are you|bot|assistant/.test(msg)) {
    return `Main BRAIN SWAP ka AI Assistant hoon! 🤖\n\nMujhe banaya gaya hai taaki aapko platform use karne mein help mil sake. Main aapke:\n• Skills & Matches\n• Sessions & Scheduling\n• Messages & Conversations\n• Profile & Ratings\n\n...ke baare mein guide kar sakta hoon. Poochiye kuch bhi!`
  }

  // Skills
  if (/skill|add skill|remove skill|offer|want/.test(msg)) {
    const skillList =
      skills.length > 0 ? `\n\nAapke current skills: ${skills.join(", ")}` : ""
    return `Skills manage karna bahut easy hai! 🎯${skillList}\n\n**Skills add karne ke liye:**\n1. Profile page pe jaayein\n2. "Add Skill" button click karein\n3. Skill name, type (Offer/Want) aur level select karein\n\nJitne zyaada skills add karenge, utne better matches milenge!`
  }

  // Matches
  if (/match|matches|compatible|find people|connect/.test(msg)) {
    return `Smart Matching system aapke liye kaam karta hai! 🤝\n\nAapke abhi **${matches} active matches** hain.\n\n**Matching kaise hota hai:**\n• Jo skills aap offer karte ho, woh doosron ki "want" list se match hoti hain\n• Compatibility score 0-100% hota hai\n• Jitna zyaada overlap, utna better match\n\nMatches page pe jaake apne matches dekh sakte hain!`
  }

  // Sessions
  if (/session|schedule|book|meeting|call|class/.test(msg)) {
    return `Sessions BRAIN SWAP ka dil hain! 📅\n\nAapke **${sessions} sessions** hain abhi.\n\n**Session schedule karne ke steps:**\n1. Sessions page pe jaayein\n2. "New Session" button click karein\n3. Match select karein, topic likhein, date/time choose karein\n4. Submit karein — doosra user accept/reject kar sakta hai\n\n**Tips:**\n• Google Meet ya Zoom link share karein\n• Session ke baad rating zaroor dein!`
  }

  // Messages / Chat
  if (/message|chat|talk|conversation|inbox/.test(msg)) {
    return `Messages feature se aap apne matches ke saath directly baat kar sakte hain! 💬\n\n**Kaise use karein:**\n1. Messages page pe jaayein\n2. Left sidebar mein conversation select karein\n3. Type karein aur Enter dabayein\n\n**Pro tip:** Session schedule karne se pehle message karke topic decide kar lein — isse session zyaada productive hota hai!`
  }

  // Ratings
  if (/rating|review|feedback|star|rate/.test(msg)) {
    return `Ratings aapki credibility build karte hain! ⭐\n\n**Rating system:**\n• Completed session ke baad 1-5 stars de sakte hain\n• Feedback likhna optional hai but helpful hai\n• Aapki average rating profile pe dikhti hai\n\n**Ratings page pe:**\n• Apni received ratings dekh sakte hain\n• Doosron ko rate kar sakte hain\n\nAchhi ratings se zyaada matches milte hain!`
  }

  // Profile
  if (/profile|bio|photo|picture|avatar|location|edit/.test(msg)) {
    return `Profile aapka BRAIN SWAP identity hai! 👤\n\n**Profile mein edit kar sakte hain:**\n• Name aur Bio\n• Location (city, state)\n• Profile picture upload/remove\n• Skills manage karna\n\n**Profile strength badhane ke liye:**\n✅ Bio likhein\n✅ Location add karein\n✅ Skills add karein (offer + want dono)\n✅ Pehla session complete karein`
  }

  // Collab Board
  if (/collab|project|team|board|collaborate/.test(msg)) {
    return `Collab Board ek exciting feature hai! 🚀\n\n**Kya hai Collab Board:**\n• Yahan aap project ideas post kar sakte hain\n• Doosre users se collaborate kar sakte hain\n• Skills ke basis pe team bana sakte hain\n\n**Kaise use karein:**\n1. Collab Board page pe jaayein\n2. "New Post" se apna project idea share karein\n3. Ya doosron ke posts pe "Request to Join" karein`
  }

  // How to get started
  if (/start|begin|new|kaise|how|guide|help|tutorial/.test(msg)) {
    return `BRAIN SWAP pe shuru karna bahut easy hai! 🎉\n\n**Step-by-step guide:**\n1. **Profile complete karein** — bio aur location add karein\n2. **Skills add karein** — kya offer karte ho, kya seekhna chahte ho\n3. **Matches dekho** — compatible users se connect karein\n4. **Message karein** — introduce yourself\n5. **Session schedule karein** — date/time fix karein\n6. **Rating dein** — session ke baad feedback share karein\n\nKoi specific step mein help chahiye?`
  }

  // Thank you
  if (/thanks|thank you|shukriya|dhanyawad|great|awesome|helpful/.test(msg)) {
    return `Khushi hui madad karke! 😊🙏\n\nAur koi sawaal ho toh zaroor poochiye. BRAIN SWAP pe aapka learning journey successful ho — yahi meri dua hai! 🌟`
  }

  // Bye
  if (/bye|goodbye|alvida|ok thanks|ok bye|chal/.test(msg)) {
    return `Alvida ${userName}! 👋\n\nKhub seekho, khub sikhao! BRAIN SWAP pe milte hain. 🙏`
  }

  // Default intelligent fallback
  const fallbacks = [
    `Samajh nahi aaya poori baat, lekin main help karne ki koshish karunga! 😊\n\nAap in topics ke baare mein pooch sakte hain:\n• Skills add/remove karna\n• Matches kaise kaam karte hain\n• Session schedule karna\n• Messages aur chat\n• Profile edit karna\n• Ratings aur reviews`,
    `Interesting sawaal! 🤔 Thoda aur detail mein batayein?\n\nYa aap directly pooch sakte hain:\n• "How to add skills?"\n• "How to schedule a session?"\n• "How do matches work?"`,
    `Main abhi is topic pe expert nahi hoon, but BRAIN SWAP ke features ke baare mein zaroor help kar sakta hoon! 💡\n\nKya aap matches, sessions, skills, ya profile ke baare mein jaanna chahte hain?`,
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text: "Namaste! 🙏 Main BRAIN SWAP Assistant hoon.\n\nAapki kaise madad kar sakta hoon? Skills, Matches, Sessions ya kuch aur poochiye!",
      time: getTime(),
    },
  ])
  const [typing, setTyping] = useState(false)
  const [pos, setPos] = useState({ x: 24, y: window.innerHeight - 90 })
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const hasDragged = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()
  const { skills, matches, sessions } = useAppStore()

  const offeredSkills = skills
    .filter((s) => s.type === "offer")
    .map((s) => s.skillName)
  const activeMatches = matches.filter((m) => m.status === "active").length
  const totalSessions = sessions.length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus()
  }, [open, minimized])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    hasDragged.current = false
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    setDragging(true)
  }, [pos])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      hasDragged.current = true
      const W = window.innerWidth, H = window.innerHeight
      const elW = open ? 360 : 56
      const elH = open ? (minimized ? 56 : 520) : 56
      setPos({
        x: Math.min(Math.max(0, e.clientX - dragOffset.current.x), W - elW),
        y: Math.min(Math.max(0, e.clientY - dragOffset.current.y), H - elH),
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [dragging, open, minimized])

  const sendMessage = () => {
    if (!input.trim()) return
    const text = input.trim()
    setInput("")

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
      time: getTime(),
    }
    setMessages((prev) => [...prev, userMsg])

    setTyping(true)
    setTimeout(
      () => {
        setTyping(false)
        const reply = getBotReply(
          text,
          user?.name?.split(" ")[0] ?? "User",
          offeredSkills,
          activeMatches,
          totalSessions
        )
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "bot", text: reply, time: getTime() },
        ])
      },
      1000 + Math.random() * 800
    )
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickReplies = [
    "How to add skills?",
    "How do matches work?",
    "Schedule a session",
    "How to rate someone?",
  ]

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onMouseDown={onDragStart}
          onClick={() => { if (!hasDragged.current) setOpen(true) }}
          className="animate-pulse-glow fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/40 hover:scale-110 transition-transform duration-200"
          style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "grab" }}
          aria-label="Open chatbot"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-background bg-green-400" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={`fixed z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 transition-[height] duration-300 ${
            minimized ? "h-14" : "h-[520px]"
          }`}
          style={{
            left: pos.x,
            top: pos.y,
            background: "linear-gradient(145deg, #0f1729 0%, #0d1120 100%)",
          }}
        >
          {/* Header — drag handle */}
          <div
            onMouseDown={onDragStart}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
            className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 px-4 py-3 select-none"
          >
            <GripHorizontal className="h-3.5 w-3.5 text-white/30 shrink-0" />
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                BRAIN SWAP Assistant
                <Sparkles className="h-3 w-3 text-yellow-400" />
              </p>
              <p className="flex items-center gap-1 text-xs text-green-400">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                Online • Always here to help
              </p>
            </div>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setMinimized(!minimized)}
              className="p-1 text-white/40 transition-colors hover:text-white/80"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setOpen(false)}
              className="p-1 text-white/40 transition-colors hover:text-white/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                          : "rounded-bl-sm border border-white/8 bg-white/8 text-white/85"
                      }`}
                    >
                      {msg.text}
                      <p
                        className={`mt-1 text-[10px] ${msg.role === "user" ? "text-right text-white/60" : "text-white/35"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex justify-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-white/8 bg-white/8 px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick replies */}
              {messages.length <= 2 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        const userMsg: ChatMessage = {
                          id: Date.now(),
                          role: "user",
                          text: q,
                          time: getTime(),
                        }
                        setMessages((prev) => [...prev, userMsg])
                        setTyping(true)
                        setTimeout(
                          () => {
                            setTyping(false)
                            const reply = getBotReply(
                              q,
                              user?.name?.split(" ")[0] ?? "User",
                              offeredSkills,
                              activeMatches,
                              totalSessions
                            )
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: Date.now() + 1,
                                role: "bot",
                                text: reply,
                                time: getTime(),
                              },
                            ])
                          },
                          1000 + Math.random() * 800
                        )
                      }}
                      className="rounded-full border border-indigo-500/40 px-2.5 py-1.5 text-[11px] text-indigo-300 transition-colors hover:bg-indigo-500/20"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="shrink-0 border-t border-white/8 px-3 pt-2 pb-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-3 py-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Kuch bhi poochiye..."
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
