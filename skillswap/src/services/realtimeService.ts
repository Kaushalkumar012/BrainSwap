import type { Message } from "@/types"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

interface RealtimeHandlers {
  onMessage?: (message: Message) => void
  onTyping?: (payload: { userId: number; isTyping: boolean }) => void
}

export function createRealtimeConnection(
  token: string,
  handlers: RealtimeHandlers
) {
  const streamUrl = `${API_BASE}/realtime/stream?token=${encodeURIComponent(token)}`
  const eventSource = new EventSource(streamUrl)

  eventSource.addEventListener("message:new", (event) => {
    handlers.onMessage?.(JSON.parse((event as MessageEvent).data) as Message)
  })

  eventSource.addEventListener("typing", (event) => {
    handlers.onTyping?.(
      JSON.parse((event as MessageEvent).data) as {
        userId: number
        isTyping: boolean
      }
    )
  })

  return eventSource
}
