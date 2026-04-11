import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '@/services/socketService';

/**
 * Hook to initialize and manage Socket.io connection
 */
export function useSocket(token?: string): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      socketService.disconnect();
      socketRef.current = null;
      return;
    }

    // Connect if not already connected
    if (!socketService.isConnected()) {
      socketRef.current = socketService.connect(token);
    } else {
      socketRef.current = socketService.getSocket();
    }

    return () => {
      // Keep connection alive on unmount, don't disconnect
      // This allows data to flow across multiple component instances
    };
  }, [token]);

  return socketRef.current;
}

/**
 * Hook for real-time chat functionality
 */
export function useRealtimeChat(
  targetUserId: number,
  token?: string
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !targetUserId) return;

    socketRef.current = socketService.isConnected()
      ? socketService.getSocket()
      : socketService.connect(token);

    if (socketRef.current) {
      socketRef.current.emit('chat:join', { targetUserId });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('chat:leave', { targetUserId });
      }
    };
  }, [token, targetUserId]);

  return {
    sendMessage: (message: string) => {
      socketService.sendMessage(targetUserId, message);
    },
    setTyping: (isTyping: boolean) => {
      socketService.setTyping(targetUserId, isTyping);
    },
  };
}

/**
 * Hook for real-time chatbot functionality
 */
export function useRealtimeBot(token?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = socketService.isConnected()
      ? socketService.getSocket()
      : socketService.connect(token);
  }, [token]);

  return {
    sendMessage: (message: string, context?: any) => {
      socketService.sendBotMessage(message, context);
    },
    clearConversation: () => {
      socketService.clearBotConversation();
    },
  };
}

/**
 * Hook for presence/online status tracking
 */
export function usePresence(userIds: number[], token?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || userIds.length === 0) return;

    socketRef.current = socketService.isConnected()
      ? socketService.getSocket()
      : socketService.connect(token);

    if (socketRef.current) {
      socketService.subscribeToPresence(userIds);
    }

    return () => {
      if (socketRef.current) {
        socketService.unsubscribeFromPresence(userIds);
      }
    };
  }, [token, userIds.join(',')]); // Join to avoid array comparison issues

  return {
    subscribeToPresence: (ids: number[]) => {
      socketService.subscribeToPresence(ids);
    },
    unsubscribeFromPresence: (ids: number[]) => {
      socketService.unsubscribeFromPresence(ids);
    },
  };
}
