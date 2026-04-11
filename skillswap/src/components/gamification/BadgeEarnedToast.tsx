import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '@/store/gamificationStore';
import { toast } from 'sonner';

/**
 * Toast notification for when badge is earned
 * Uses sonner toast system for automatic dismissal
 */
export function BadgeEarnedToast() {
  const { showBadgeToast, pendingBadge, hideBadgeEarned } = useGamificationStore();

  useEffect(() => {
    if (!showBadgeToast || !pendingBadge) return;

    // Show toast using sonner
    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-3xl">{pendingBadge.icon_emoji}</span>
        <div>
          <p className="font-bold">{pendingBadge.name}</p>
          <p className="text-sm text-muted-foreground">{pendingBadge.rarity} Badge</p>
        </div>
      </div>,
      {
        duration: 4000,
        onDismiss: () => hideBadgeEarned(),
      }
    );

    return () => {
      hideBadgeEarned();
    };
  }, [showBadgeToast, pendingBadge, hideBadgeEarned]);

  return null;
}

/**
 * Alternative custom toast component if sonner not preferred
 */
export function BadgeEarnedCustomToast() {
  const { showBadgeToast, pendingBadge, hideBadgeEarned } = useGamificationStore();

  useEffect(() => {
    if (!showBadgeToast) return;

    const timer = setTimeout(() => {
      hideBadgeEarned();
    }, 4000);

    return () => clearTimeout(timer);
  }, [showBadgeToast, hideBadgeEarned]);

  return (
    <AnimatePresence>
      {showBadgeToast && pendingBadge && (
        <motion.div
          className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-lg border border-border bg-background shadow-lg p-4 max-w-xs"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          >
            {pendingBadge.icon_emoji}
          </motion.span>

          <div>
            <p className="font-bold text-sm">{pendingBadge.name}</p>
            <p className="text-xs text-muted-foreground">{pendingBadge.rarity} Badge</p>
            <p className="text-xs text-primary mt-1">+{pendingBadge.points_reward} points</p>
          </div>

          <motion.button
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={hideBadgeEarned}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
