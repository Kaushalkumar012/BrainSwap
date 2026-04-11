import api from "./api"

export interface PresenceResponse {
  onlineUserIds: number[]
  statuses: Record<number, boolean>
  typing: boolean
}

export const presenceService = {
  ping: () => api.post("/presence/ping"),
  setTyping: (partnerId: number, isTyping: boolean) =>
    api.post("/presence/typing", { partnerId, isTyping }),
  getPresence: (userIds: number[], threadUserId?: number) =>
    api.get<PresenceResponse>("/presence", {
      params: {
        userIds: userIds.join(","),
        ...(threadUserId ? { threadUserId } : {}),
      },
    }),
}
