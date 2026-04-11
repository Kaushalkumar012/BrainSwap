import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socketService';
import { Toaster, toast } from 'sonner';

/**
 * Real-time notifications component
 * Shows toasts for various real-time events like new messages, user online/offline
 */
export function RealtimeNotifications() {
  const { token } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!token || isInitialized) return;

    // Initialize socket connection
    socketService.connect(token);

    // Listen for new messages
    const unsubscribeMessage = socketService.onMessage((data) => {
      // Don't show toast for messages - they're handled by the Messages page
      console.log('📨 New message received:', data);
    });

    // Listen for messages received in other windows
    const unsubscribeReceived = socketService.onMessageReceived((data) => {
      const senderName = data.senderName || 'Someone';
      toast.info(`📨 ${senderName} sent you a message!`, {
        duration: 3000,
      });
    });

    // Listen for presence changes
    const unsubscribeOnline = socketService.onUserOnline((data) => {
      console.log(`🟢 User ${data.userId} came online`);
    });

    const unsubscribeOffline = socketService.onUserOffline((data) => {
      console.log(`🔴 User ${data.userId} went offline`);
    });

    // Listen for bot errors
    const unsubscribeBotError = socketService.onBotError((data) => {
      toast.error('❌ ' + data.message, {
        duration: 3000,
      });
    });

    // Listen for generic errors
    socketService.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('⚠️ Connection error. Reconnecting...', {
        duration: 2000,
      });
    });

    setIsInitialized(true);

    return () => {
      unsubscribeMessage();
      unsubscribeReceived();
      unsubscribeOnline();
      unsubscribeOffline();
      unsubscribeBotError();
    };
  }, [token, isInitialized]);

  return <Toaster position="top-right" richColors />;
}
