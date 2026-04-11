import api from "./api"
import { socketService } from "./socketService"

export interface PresenceResponse {
  onlineUserIds: number[]
  statuses: Record<number, boolean>
  typing: boolean
}

export const presenceService = {
  ping: () => api.post("/presence/ping"),
  setTyping: (partnerId: number, isTyping: boolean) => {
    // Use Socket.io for real-time typing indicator
    socketService.setTyping(partnerId, isTyping)
    // Fallback to REST API if socket not connected
    return api.post("/presence/typing", { partnerId, isTyping })
  },
  getPresence: (userIds: number[], threadUserId?: number) => {
    // Subscribe to presence updates via Socket.io
    socketService.subscribeToPresence(userIds)
    
    // Get initial state from REST API
    return api.get<PresenceResponse>("/presence", {
      params: {
        userIds: userIds.join(","),
        ...(threadUserId ? { threadUserId } : {}),
      },
    })
  },
}
