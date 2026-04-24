import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Search, MessageSquare, Smile, X, Reply, CornerUpLeft, Phone, Video, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { useAuthStore } from "@/store/authStore"
import { messageService } from "@/services/messageService"
import { socketService } from "@/services/socketService"
import { format } from "date-fns"

type Msg = {
  id: number
  senderId: number
  receiverId: number
  message: string
  createdAt: string
  status?: "sending" | "sent" | "read"
  replyTo?: { id: number; message: string; senderName: string }
  reactions?: Record<string, number[]> // emoji -> userIds
}

type Conv = {
  id: number
  participant: { id: number; name: string; avatar?: string }
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"]
const EMOJI_PICKER = [
  "😀","😂","😍","🥰","😎","🤔","😅","🙏","👍","❤️","🔥","✨",
  "🎉","💯","😭","🤣","😊","😇","🥳","😏","😒","😤","🤯","💪",
  "👀","🙌","💀","😴","🤝","👋","🫡","💬","🚀","⭐","🎯","💡",
]

export default function Messages() {
  const { user, token } = useAuthStore()
  const [conversations, setConversations] = useState<Conv[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set())

  // Keep window cache in sync for call pre-check
  useEffect(() => {
    (window as any).__onlineUsers = onlineUsers
  }, [onlineUsers])
  const [replyTo, setReplyTo] = useState<Msg | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null)
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const selected = conversations.find(c => c.id === selectedId) ?? null

  // Load conversations
  useEffect(() => {
    messageService.getConversations()
      .then(res => {
        const data: Conv[] = res.data
        data.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
        setConversations(data)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Load messages on conversation change
  useEffect(() => {
    if (!selected) return
    setMessages([])
    setReplyTo(null)
    messageService.getMessages(selected.participant.id)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]))
    setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unreadCount: 0 } : c))
  }, [selectedId]) // eslint-disable-line

  // Socket setup + presence
  useEffect(() => {
    if (!token) return
    if (!socketService.isConnected()) socketService.connect(token)

    const unsub1 = socketService.onMessage((msg: Msg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      setConversations(prev => {
        const updated = prev.map(c =>
          c.participant.id === msg.senderId || c.participant.id === msg.receiverId
            ? { ...c, lastMessage: msg.message, lastMessageAt: msg.createdAt }
            : c
        )
        return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      })
    })

    const unsub2 = socketService.onTyping(({ userId, isTyping: t }: { userId: number; isTyping: boolean }) => {
      if (selected && userId === selected.participant.id) setIsTyping(t)
    })

    const unsub3 = socketService.onUserOnline(({ userId }: { userId: number }) => {
      setOnlineUsers(prev => new Set([...prev, userId]))
    })

    const unsub4 = socketService.onUserOffline(({ userId }: { userId: number }) => {
      setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s })
    })

    // Subscribe to presence for all conversation participants
    const ids = conversations.map(c => c.participant.id)
    if (ids.length > 0) socketService.subscribeToPresence(ids)

    return () => { unsub1(); unsub2(); unsub3(); unsub4() }
  }, [token, selected, conversations.length]) // eslint-disable-line

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !selected) return
    const text = input.trim()
    setInput("")
    setShowEmojiPicker(false)
    const reply = replyTo
    setReplyTo(null)
    inputRef.current?.focus()

    const temp: Msg = {
      id: Date.now(),
      senderId: user!.id,
      receiverId: selected.participant.id,
      message: text,
      createdAt: new Date().toISOString(),
      status: "sending",
      replyTo: reply ? { id: reply.id, message: reply.message, senderName: reply.senderId === user?.id ? "You" : selected.participant.name } : undefined,
    }
    setMessages(prev => [...prev, temp])

    try {
      const res = await messageService.sendMessage(selected.participant.id, text)
      setMessages(prev => prev.map(m => m.id === temp.id ? { ...res.data, status: "sent", replyTo: temp.replyTo } : m))
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === selected.id ? { ...c, lastMessage: text, lastMessageAt: res.data.createdAt } : c
        )
        return updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      })
    } catch {
      setMessages(prev => prev.filter(m => m.id !== temp.id))
    }
  }

  const handleInputChange = useCallback((val: string) => {
    setInput(val)
    if (!selected) return
    socketService.setTyping(selected.participant.id, val.length > 0)
    if (typingRef.current) clearTimeout(typingRef.current)
    typingRef.current = setTimeout(() => socketService.setTyping(selected.participant.id, false), 2000)
  }, [selected])

  const handleDelete = async (msgId: number) => {
    setMessages(prev => prev.filter(m => m.id !== msgId))
    try {
      await messageService.deleteMessage(msgId)
    } catch {
      if (selected) {
        messageService.getMessages(selected.participant.id)
          .then(res => setMessages(res.data))
          .catch(() => {})
      }
    }
  }

  const handleReaction = (msgId: number, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m
      const reactions = { ...(m.reactions ?? {}) }
      const users = reactions[emoji] ?? []
      if (users.includes(user!.id)) {
        reactions[emoji] = users.filter(id => id !== user!.id)
        if (reactions[emoji].length === 0) delete reactions[emoji]
      } else {
        reactions[emoji] = [...users, user!.id]
      }
      return { ...m, reactions }
    }))
    setShowReactionPicker(null)
  }

  const filtered = conversations.filter(c =>
    c.participant?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const thread = messages.filter(m =>
    (m.senderId === user?.id && m.receiverId === selected?.participant.id) ||
    (m.receiverId === user?.id && m.senderId === selected?.participant.id)
  )

  const isOnline = (userId: number) => onlineUsers.has(userId)

  const TickIcon = ({ status }: { status?: string }) => {
    if (status === "sending") return <span className="ml-1 text-[10px]">·</span>
    if (status === "read") return <span className="ml-1 text-[10px] text-blue-400">✓✓</span>
    return <span className="ml-1 text-[10px] opacity-70">✓✓</span>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">

      {/* Page title */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" /> Messages
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {loading ? "Loading..." : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Chat shell */}
      <div className="flex flex-1 min-h-0 rounded-xl border border-border overflow-hidden shadow-sm">

        {/* ── Sidebar ── */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-card">

          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 h-9 text-sm bg-muted/40 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2.5 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <MessageSquare className="w-8 h-8 opacity-20" />
                <p className="text-xs">No conversations yet</p>
              </div>
            )}

            {!loading && filtered.map(conv => {
              const active = selectedId === conv.id
              const online = isOnline(conv.participant.id)
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-border/40 transition-colors
                    hover:bg-muted/50
                    ${active ? "bg-primary/10 border-l-[3px] border-l-primary" : "border-l-[3px] border-l-transparent"}`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar name={conv.participant.name} avatar={conv.participant.avatar} size="md" />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-foreground"}`}>
                        {conv.participant.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {format(new Date(conv.lastMessageAt), "h:mm a")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── Chat panel ── */}
        {!selected ? (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center space-y-2 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto opacity-20" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0 bg-background">

            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
              <div className="relative">
                <UserAvatar name={selected.participant.name} avatar={selected.participant.avatar} size="md" />
                {isOnline(selected.participant.id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">{selected.participant.name}</p>
                <p className="text-xs h-4">
                  {isTyping
                    ? <span className="text-primary italic">typing...</span>
                    : isOnline(selected.participant.id)
                      ? <span className="text-green-500">Online</span>
                      : <span className="text-muted-foreground">Offline</span>
                  }
                </p>
              </div>
              {/* Call buttons */}
              <button
                onClick={() => (window as any).__startCall?.(selected.participant, "audio")}
                className="w-9 h-9 rounded-full bg-muted hover:bg-green-500/20 hover:text-green-500 flex items-center justify-center transition-colors text-muted-foreground"
                title="Voice call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => (window as any).__startCall?.(selected.participant, "video")}
                className="w-9 h-9 rounded-full bg-muted hover:bg-blue-500/20 hover:text-blue-500 flex items-center justify-center transition-colors text-muted-foreground"
                title="Video call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {thread.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No messages yet. Say hello! 👋</p>
                </div>
              )}

              {thread.map((msg, i) => {
                const isMe = msg.senderId === user?.id
                const showDate = i === 0 ||
                  new Date(msg.createdAt).toDateString() !== new Date(thread[i - 1].createdAt).toDateString()
                const reactionEntries = Object.entries(msg.reactions ?? {}).filter(([, ids]) => ids.length > 0)

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[11px] text-muted-foreground px-2 bg-background">
                          {format(new Date(msg.createdAt), "MMM d, yyyy")}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}

                    <div
                      className={`group flex items-end gap-2 py-0.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      onMouseEnter={() => setHoveredMsgId(msg.id)}
                      onMouseLeave={() => { setHoveredMsgId(null); setShowReactionPicker(null) }}
                    >
                      {!isMe && (
                        <UserAvatar
                          name={selected.participant.name}
                          avatar={selected.participant.avatar}
                          size="sm"
                        />
                      )}

                      {/* Hover actions */}
                      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                        {/* Reply */}
                        <button
                          onClick={() => setReplyTo(msg)}
                          className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
                          title="Reply"
                        >
                          <CornerUpLeft className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {/* React */}
                        <div className="relative">
                          <button
                            onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                            className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
                            title="React"
                          >
                            <Smile className="w-3 h-3 text-muted-foreground" />
                          </button>
                          {showReactionPicker === msg.id && (
                            <div className={`absolute bottom-8 z-20 bg-card border border-border rounded-full shadow-lg px-2 py-1.5 flex gap-1 ${isMe ? "right-0" : "left-0"}`}>
                              {QUICK_EMOJIS.map(e => (
                                <button
                                  key={e}
                                  onClick={() => handleReaction(msg.id, e)}
                                  className="text-base hover:scale-125 transition-transform"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Delete — only for own messages */}
                        {isMe && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="w-6 h-6 rounded-full bg-muted hover:bg-red-500/20 flex items-center justify-center transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-500" />
                          </button>
                        )}
                      </div>

                      <div className={`flex flex-col gap-0.5 max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                        {/* Reply preview */}
                        {msg.replyTo && (
                          <div className={`text-[11px] px-2.5 py-1 rounded-lg border-l-2 border-primary bg-muted/60 max-w-full truncate mb-0.5 ${isMe ? "self-end" : "self-start"}`}>
                            <span className="font-medium text-primary">{msg.replyTo.senderName}: </span>
                            <span className="text-muted-foreground">{msg.replyTo.message}</span>
                          </div>
                        )}

                        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
                          ${isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm border border-border"
                          }`}
                        >
                          {msg.message}
                        </div>

                        {/* Reactions */}
                        {reactionEntries.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {reactionEntries.map(([emoji, ids]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className={`flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full border transition-colors
                                  ${ids.includes(user!.id) ? "bg-primary/20 border-primary/40" : "bg-muted border-border hover:bg-muted/80"}`}
                              >
                                <span>{emoji}</span>
                                {ids.length > 1 && <span className="text-muted-foreground">{ids.length}</span>}
                              </button>
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-muted-foreground px-1 flex items-center">
                          {format(new Date(msg.createdAt), "h:mm a")}
                          {isMe && <TickIcon status={msg.status} />}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <UserAvatar name={selected.participant.name} avatar={selected.participant.avatar} size="sm" />
                  <div className="bg-muted border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Reply bar */}
            {replyTo && (
              <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-2 shrink-0">
                <Reply className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-primary">
                    {replyTo.senderId === user?.id ? "You" : selected.participant.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{replyTo.message}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input bar */}
            <div className="px-4 py-3 border-t border-border bg-card shrink-0">
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="mb-2 p-2 bg-card border border-border rounded-xl shadow-lg grid grid-cols-12 gap-1">
                  {EMOJI_PICKER.map(e => (
                    <button
                      key={e}
                      onClick={() => { setInput(prev => prev + e); inputRef.current?.focus() }}
                      className="text-lg hover:scale-125 transition-transform p-0.5"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmojiPicker(v => !v)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${showEmojiPicker ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={`Message ${selected.participant.name}...`}
                  className="flex-1 h-10 text-sm bg-muted/40 border-border"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
