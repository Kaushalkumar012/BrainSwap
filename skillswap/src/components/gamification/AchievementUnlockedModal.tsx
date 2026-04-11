import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '@/store/gamificationStore';
import { Button } from '@/components/ui/button';

/**
 * Modal showing when achievement is unlocked
 */
export function AchievementUnlockedModal() {
  const { showAchievementModal, pendingAchievement, hideAchievementUnlock } = useGamificationStore();

  return (
    <AnimatePresence>
      {showAchievementModal && pendingAchievement && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={hideAchievementUnlock}
        >
          <motion.div
            className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 max-w-sm shadow-2xl relative"
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative elements */}
            <motion.div
              className="absolute -top-4 -left-4 text-6xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              ⭐
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -right-4 text-6xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              ✨
            </motion.div>

            <div className="text-center relative z-10">
              <motion.p
                className="text-sm font-bold text-yellow-300 uppercase tracking-widest mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Achievement Unlocked!
              </motion.p>

              <motion.div
                className="text-7xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                🏆
              </motion.div>

              <motion.h2
                className="text-3xl font-black text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {pendingAchievement.name}
              </motion.h2>

              <motion.p
                className="text-purple-200 text-sm mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {pendingAchievement.description}
              </motion.p>

              <motion.div
                className="bg-yellow-400/20 rounded-lg p-3 mb-6 border border-yellow-400/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-yellow-300 font-bold text-lg">
                  +{pendingAchievement.xp_reward} XP
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  onClick={hideAchievementUnlock}
                  className="w-full bg-white text-purple-700 hover:bg-purple-100 font-bold"
                >
                  Awesome! 🎉
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
