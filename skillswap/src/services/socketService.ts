import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  /**
   * Initialize socket connection with JWT token
   */
  connect(token: string): Socket {
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    this.token = token;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket.io error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ===== Chat Events =====

  /**
   * Join a conversation
   */
  joinConversation(targetUserId: number): void {
    this.socket?.emit('chat:join', { targetUserId });
  }

  /**
   * Leave a conversation
   */
  leaveConversation(targetUserId: number): void {
    this.socket?.emit('chat:leave', { targetUserId });
  }

  /**
   * Send a message
   */
  sendMessage(receiverId: number, message: string): void {
    this.socket?.emit('chat:message', { receiverId, message });
  }

  /**
   * Send typing indicator
   */
  setTyping(targetUserId: number, isTyping: boolean): void {
    this.socket?.emit('chat:typing', { targetUserId, isTyping });
  }

  /**
   * Listen for new messages
   */
  onMessage(callback: (data: any) => void): () => void {
    this.socket?.on('message:new', callback);
    return () => this.socket?.off('message:new', callback);
  }

  /**
   * Listen for typing indicator
   */
  onTyping(callback: (data: any) => void): () => void {
    this.socket?.on('typing:indicator', callback);
    return () => this.socket?.off('typing:indicator', callback);
  }

  /**
   * Listen for received messages (other windows)
   */
  onMessageReceived(callback: (data: any) => void): () => void {
    this.socket?.on('message:received', callback);
    return () => this.socket?.off('message:received', callback);
  }

  // ===== Chatbot Events =====

  /**
   * Send message to chatbot
   */
  sendBotMessage(message: string, context?: any): void {
    this.socket?.emit('bot:message', { message, context });
  }

  /**
   * Clear bot conversation
   */
  clearBotConversation(): void {
    this.socket?.emit('bot:clear');
  }

  /**
   * Listen for bot responses (streaming)
   */
  onBotResponse(callback: (data: any) => void): () => void {
    this.socket?.on('bot:response', callback);
    return () => this.socket?.off('bot:response', callback);
  }

  /**
   * Listen for bot errors
   */
  onBotError(callback: (data: any) => void): () => void {
    this.socket?.on('bot:error', callback);
    return () => this.socket?.off('bot:error', callback);
  }

  /**
   * Listen for bot cleared
   */
  onBotCleared(callback: (data: any) => void): () => void {
    this.socket?.on('bot:cleared', callback);
    return () => this.socket?.off('bot:cleared', callback);
  }

  // ===== Presence Events =====

  /**
   * Subscribe to user presence updates
   */
  subscribeToPresence(userIds: number[]): void {
    this.socket?.emit('presence:subscribe', { userIds });
  }

  /**
   * Unsubscribe from user presence updates
   */
  unsubscribeFromPresence(userIds: number[]): void {
    this.socket?.emit('presence:unsubscribe', { userIds });
  }

  /**
   * Listen for user online event
   */
  onUserOnline(callback: (data: any) => void): () => void {
    this.socket?.on('presence:online', callback);
    return () => this.socket?.off('presence:online', callback);
  }

  /**
   * Listen for user offline event
   */
  onUserOffline(callback: (data: any) => void): () => void {
    this.socket?.on('presence:offline', callback);
    return () => this.socket?.off('presence:offline', callback);
  }

  /**
   * Listen for presence subscription result
   */
  onPresenceSubscribed(callback: (data: any) => void): () => void {
    this.socket?.on('presence:subscribed', callback);
    return () => this.socket?.off('presence:subscribed', callback);
  }

  /**
   * Listen for presence unsubscription result
   */
  onPresenceUnsubscribed(callback: (data: any) => void): () => void {
    this.socket?.on('presence:unsubscribed', callback);
    return () => this.socket?.off('presence:unsubscribed', callback);
  }

  // ===== Call (WebRTC Signaling) Events =====

  /** Returns false if we know the user is offline, true/undefined if online or unknown */
  isUserOnline(userId: number): boolean | undefined {
    // We track this via presence events in the app store — check window-level cache
    const cache = (window as any).__onlineUsers as Set<number> | undefined
    if (!cache) return undefined // unknown, let the call proceed
    return cache.has(userId)
  }

  sendCallOffer(targetUserId: number, offer: RTCSessionDescriptionInit, callType: 'video' | 'audio', callId: string): void {
    this.socket?.emit('call:offer', { targetUserId, offer, callType, callId })
  }

  sendCallAnswer(targetUserId: number, answer: RTCSessionDescriptionInit, callId: string): void {
    this.socket?.emit('call:answer', { targetUserId, answer, callId })
  }

  sendIceCandidate(targetUserId: number, candidate: RTCIceCandidateInit, callId: string): void {
    this.socket?.emit('call:ice-candidate', { targetUserId, candidate, callId })
  }

  endCall(targetUserId: number, callId: string): void {
    this.socket?.emit('call:end', { targetUserId, callId })
  }

  rejectCall(targetUserId: number, callId: string): void {
    this.socket?.emit('call:reject', { targetUserId, callId })
  }

  onIncomingCall(callback: (data: any) => void): () => void {
    this.socket?.on('call:incoming', callback)
    return () => this.socket?.off('call:incoming', callback)
  }

  onCallAnswered(callback: (data: any) => void): () => void {
    this.socket?.on('call:answered', callback)
    return () => this.socket?.off('call:answered', callback)
  }

  onCallIceCandidate(callback: (data: any) => void): () => void {
    this.socket?.on('call:ice-candidate', callback)
    return () => this.socket?.off('call:ice-candidate', callback)
  }

  onCallEnded(callback: (data: any) => void): () => void {
    this.socket?.on('call:ended', callback)
    return () => this.socket?.off('call:ended', callback)
  }

  onCallRejected(callback: (data: any) => void): () => void {
    this.socket?.on('call:rejected', callback)
    return () => this.socket?.off('call:rejected', callback)
  }

  // ===== Generic Event Listener =====

  /**
   * Listen to any event
   */
  on(event: string, callback: (data: any) => void): () => void {
    this.socket?.on(event, callback);
    return () => this.socket?.off(event, callback);
  }

  /**
   * Stop listening to event
   */
  off(event: string, callback: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  /**
   * Emit any event
   */
  emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }
}

// Singleton instance
export const socketService = new SocketService();
