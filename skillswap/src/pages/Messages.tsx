import { useState, useRef, useEffect } from "react"
import { Send, MessageSquare, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { useAppStore } from "@/store/appStore"
import { useAuthStore } from "@/store/authStore"
import { messageService } from "@/services/messageService"
import { presenceService } from "@/services/presenceService"
import { createRealtimeConnection } from "@/services/realtimeService"
import { getAutoReply, getReplyDelay } from "@/lib/autoReply"
import { format } from "date-fns"
import type { Message, PresenceState } from "@/types"

export default function Messages() {
  const { conversations, matches } = useAppStore()
  const { user, token } = useAuthStore()

  const effectiveConversations =
    conversations.length > 0
      ? conversations
      : matches.map((m, i) => ({
          id: m.id,
          participant: m.matchedUser,
          lastMessage: "Say hello! 👋",
          lastMessageAt: new Date(Date.now() - i * 60000).toISOString(),
          unreadCount: 0,
        }))

  const [selectedId, setSelectedId] = useState<number | null>(
    effectiveConversations[0]?.id ?? null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [presence, setPresence] = useState<PresenceState>({
    onlineUserIds: [],
    statuses: {},
    typing: false,
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<number | null>(null)

  const selected = effectiveConversations.find((c) => c.id === selectedId)
  const activeUsers = effectiveConversations
    .filter((conv) => presence.statuses[conv.participant.id])
    .slice(0, 5)

  useEffect(() => {
    if (!selected) return

    messageService
      .getMessages(selected.participant.id)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]))
  }, [selected?.participant.id])

  useEffect(() => {
    const userIds = effectiveConversations.map((conv) => conv.participant.id)
    if (userIds.length === 0) return

    const refreshPresence = () => {
      presenceService
        .getPresence(userIds, selected?.participant.id)
        .then((res) => setPresence(res.data))
        .catch(() => {})
    }

    refreshPresence()
    const interval = window.setInterval(refreshPresence, 5000)
    return () => window.clearInterval(interval)
  }, [effectiveConversations, selected?.participant.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, presence.typing])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!token) return

    const realtime = createRealtimeConnection(token, {
      onMessage: (message) => {
        const isRelevant =
          selected &&
          ((message.senderId === user?.id &&
            message.receiverId === selected.participant.id) ||
            (message.receiverId === user?.id &&
              message.senderId === selected.participant.id))

        if (isRelevant) {
          setMessages((prev) => {
            if (prev.some((item) => item.id === message.id)) {
              return prev
            }
            return [...prev, message]
          })
        }

        if (selected && message.senderId === selected.participant.id) {
          setPresence((prev) => ({ ...prev, typing: false }))
        }
      },
      onTyping: ({ userId, isTyping }) => {
        if (selected && userId === selected.participant.id) {
          setPresence((prev) => ({ ...prev, typing: isTyping }))
        }
      },
    })

    return () => {
      realtime.close()
    }
  }, [selected, token, user?.id])

  const handleSend = async () => {
    if (!input.trim() || !selected) return
    const text = input.trim()
    setInput("")

    const myMsg: Message = {
      id: Date.now(),
      senderId: user?.id ?? 1,
      receiverId: selected.participant.id,
      message: text,
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await messageService.sendMessage(
        selected.participant.id,
        text
      )
      setMessages((prev) => [...prev, res.data])
    } catch {
      setMessages((prev) => [...prev, myMsg])
    }

    presenceService.setTyping(selected.participant.id, false).catch(() => {})

    const delay = getReplyDelay()
    setTimeout(() => setIsTyping(true), 300)
    setTimeout(() => {
      setIsTyping(false)
      const replyText = getAutoReply(selected.participant.id, text)
      const replyMsg: Message = {
        id: Date.now() + 1,
        senderId: selected.participant.id,
        receiverId: user?.id ?? 1,
        message: replyText,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, replyMsg])
    }, delay)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    if (!selected) return

    const hasText = value.trim().length > 0
    presenceService.setTyping(selected.participant.id, hasText).catch(() => {})

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
    }

    if (hasText) {
      typingTimeoutRef.current = window.setTimeout(() => {
        presenceService
          .setTyping(selected.participant.id, false)
          .catch(() => {})
      }, 2000)
    }
  }

  const threadMessages = messages.filter(
    (m) =>
      (m.senderId === user?.id && m.receiverId === selected?.participant.id) ||
      (m.receiverId === user?.id && m.senderId === selected?.participant.id)
  )

  return (
    <div className="max-w-6xl space-y-4">
      <div className="animate-fade-up flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="h-6 w-6 text-primary" />
            Messages
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Keep your learning conversations flowing with matched peers.
          </p>
        </div>
        <div className="dashboard-card flex items-center gap-2 rounded-full border-0 px-4 py-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {effectiveConversations.length} active conversation
          {effectiveConversations.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="inbox-shell animate-fade-up-1 flex h-[calc(100vh-220px)] min-h-[540px] overflow-hidden">
        <div className="flex w-80 shrink-0 flex-col border-r border-cyan-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(239,247,255,0.78))] backdrop-blur-xl dark:border-border/50 dark:bg-white/[0.03]">
          <div className="space-y-3 border-b border-border/50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Inbox
              </p>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                {effectiveConversations.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                readOnly
                value=""
                placeholder="Search coming soon..."
                className="h-10 rounded-2xl border-cyan-100/80 bg-white/80 pl-9 text-sm shadow-sm dark:border-border/60 dark:bg-background/70"
              />
            </div>
            <div className="rounded-3xl border border-cyan-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(238,248,255,0.94))] p-3 shadow-[0_14px_30px_rgba(125,160,190,0.12)] dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Active now
                </p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {activeUsers.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeUsers.length > 0 ? (
                  activeUsers.map((conv) => (
                    <button
                      key={`active-${conv.id}`}
                      onClick={() => setSelectedId(conv.id)}
                      className="active-user-pill flex items-center gap-2 rounded-full px-2.5 py-2 text-left"
                    >
                      <div className="relative shrink-0">
                        <UserAvatar
                          name={conv.participant.name}
                          avatar={conv.participant.avatar}
                          size="sm"
                        />
                        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                      </div>
                      <span className="max-w-[84px] truncate text-xs font-medium">
                        {conv.participant.name}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-1 text-xs text-muted-foreground">
                    No users are active right now.
                  </p>
                )}
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {effectiveConversations.map((conv, index) => {
                const active = selectedId === conv.id
                const online = Boolean(presence.statuses[conv.participant.id])

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`conversation-card animate-fade-up flex w-full items-center gap-3 rounded-2xl p-3 text-left ${
                      active ? "active" : ""
                    }`}
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={conv.participant.name}
                        avatar={conv.participant.avatar}
                        size="md"
                      />
                      <span
                        className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                          online
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {conv.participant.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {format(new Date(conv.lastMessageAt), "h:mm a")}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {active && (isTyping || presence.typing)
                          ? "typing..."
                          : conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {selected ? (
          <div className="chat-thread flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-cyan-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(240,248,255,0.62))] px-4 py-4 backdrop-blur-xl dark:border-border/50 dark:bg-background/40">
              <div className="relative">
                <UserAvatar
                  name={selected.participant.name}
                  avatar={selected.participant.avatar}
                  size="md"
                />
                <span
                  className={`absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                    presence.statuses[selected.participant.id]
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-500"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {selected.participant.name}
                </p>
                <p className="text-xs font-medium text-primary">
                  {presence.typing || isTyping
                    ? "typing..."
                    : presence.statuses[selected.participant.id]
                      ? "Online now"
                      : "Away right now"}
                </p>
              </div>
              <div className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                Skill chat
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-5">
              <div className="space-y-4">
                {threadMessages.length === 0 && (
                  <div className="mx-auto max-w-sm rounded-3xl border border-dashed border-cyan-200/80 bg-white/72 px-5 py-8 text-center shadow-[0_14px_34px_rgba(148,163,184,0.1)] dark:border-border/60 dark:bg-background/60">
                    <MessageSquare className="mx-auto h-10 w-10 opacity-35" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No messages yet. Start a conversation and break the ice.
                    </p>
                  </div>
                )}

                {threadMessages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id
                  const showDate =
                    i === 0 ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(threadMessages[i - 1].createdAt).toDateString()

                  return (
                    <div
                      key={msg.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${i * 45}ms` }}
                    >
                      {showDate && (
                        <div className="my-4 flex items-center gap-3">
                          <Separator className="flex-1 bg-border/70" />
                          <span className="rounded-full bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                            {format(new Date(msg.createdAt), "MMM d")}
                          </span>
                          <Separator className="flex-1 bg-border/70" />
                        </div>
                      )}

                      <div
                        className={`flex items-end gap-2 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMe && (
                          <UserAvatar
                            name={selected.participant.name}
                            avatar={selected.participant.avatar}
                            size="sm"
                          />
                        )}
                        <div
                          className={`max-w-[72%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                            isMe
                              ? "chat-bubble-me rounded-br-md"
                              : "chat-bubble-other rounded-bl-md"
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p
                            className={`mt-1 text-[11px] ${
                              isMe
                                ? "text-white/70"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {(isTyping || presence.typing) && (
                  <div className="animate-fade-up flex items-end justify-start gap-2">
                    <UserAvatar
                      name={selected.participant.name}
                      avatar={selected.participant.avatar}
                      size="sm"
                    />
                    <div className="chat-bubble-other flex items-center gap-1 rounded-3xl rounded-bl-md px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-cyan-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(240,248,255,0.72))] p-4 backdrop-blur-xl dark:border-border/50 dark:bg-background/45">
              <div className="dashboard-card flex items-center gap-3 rounded-[24px] border-0 p-2">
                <Input
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selected.participant.name}...`}
                  className="h-11 rounded-2xl border-cyan-100/80 bg-white/82 text-sm shadow-none dark:border-border/50 dark:bg-background/70"
                />
                <Button
                  size="sm"
                  className="gradient-bg-animated h-11 rounded-2xl px-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="space-y-3 text-center">
              <MessageSquare className="mx-auto h-10 w-10 opacity-30" />
              <p className="text-sm">
                Connect with someone on Matches to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
