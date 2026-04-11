import type { Message } from "@/types"
import { socketService } from "./socketService"

interface RealtimeHandlers {
  onMessage?: (message: Message) => void
  onTyping?: (payload: { userId: number; isTyping: boolean }) => void
}

/**
 * Create a real-time connection using Socket.io
 * Returns an object with close() method for compatibility with SSE
 */
export function createRealtimeConnection(
  token: string,
  handlers: RealtimeHandlers
) {
  // Initialize socket if not already connected
  if (!socketService.isConnected()) {
    socketService.connect(token)
  }

  // Listen for new messages
  const unsubscribeMessage = socketService.onMessage((data: Message) => {
    handlers.onMessage?.(data)
  })

  // Listen for typing indicators
  const unsubscribeTyping = socketService.onTyping((data) => {
    // Convert socket typing format to handler format
    handlers.onTyping?.({
      userId: data.userId,
      isTyping: data.isTyping,
    })
  })

  // Return object compatible with EventSource (has close method)
  return {
    close: () => {
      unsubscribeMessage()
      unsubscribeTyping()
    },
  }
}
