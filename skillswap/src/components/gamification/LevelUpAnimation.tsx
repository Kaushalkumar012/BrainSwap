import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '@/store/gamificationStore';

/**
 * Full-screen level up celebration animation
 */
export function LevelUpAnimation() {
  const { showLevelUpModal, pendingLevelUp, hideLevelUp } = useGamificationStore();
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (!showLevelUpModal) {
      setConfetti([]);
      return;
    }

    // Generate confetti particles
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setConfetti(particles);
  }, [showLevelUpModal]);

  return (
    <AnimatePresence>
      {showLevelUpModal && pendingLevelUp && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={hideLevelUp}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti */}
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  left: `${particle.x}%`,
                  top: `${particle.y + 50}%`,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            ))}

            {/* Level up message */}
            <motion.div
              className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-12 shadow-2xl relative"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 2, repeatDelay: 0.2 }}
              >
                🚀
              </motion.div>

              <h2 className="text-4xl font-black text-white mb-2">LEVEL UP!</h2>

              <motion.p
                className="text-5xl font-black text-white mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {pendingLevelUp.newLevel}
              </motion.p>

              <p className="text-white/80 text-lg">You've reached a new milestone!</p>

              <motion.div
                className="mt-6 text-yellow-100 text-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨ Keep grinding ✨
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
