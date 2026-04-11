import { motion } from 'framer-motion';
import { useGameification } from '@/hooks/useGameification';
import { useBadges } from '@/hooks/useBadges';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { LevelUpAnimation } from '@/components/gamification/LevelUpAnimation';
import { AchievementUnlockedModal } from '@/components/gamification/AchievementUnlockedModal';
import { Progress } from '@/components/ui/progress';

export default function Badges() {
  useGameification();
  const { grouped, stats, earned, unearned } = useBadges();

  return (
    <div className="max-w-6xl space-y-6">
      <div className="animate-fade-up">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <span>🏅</span> Badges Collection
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Earn badges by completing actions and reaching milestones
        </p>
      </div>

      {/* Earning Stats */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Total Badges</p>
          <p className="mt-1 text-3xl font-black text-primary">{stats.total}</p>
        </div>

        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
          <p className="text-sm text-muted-foreground">Earned</p>
          <p className="mt-1 text-3xl font-black text-green-600 dark:text-green-400">{stats.earned}</p>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-muted-foreground">Completion</p>
          <p className="mt-1 text-3xl font-black text-amber-600 dark:text-amber-400">{stats.percent}%</p>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="rounded-lg border border-border bg-background p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Collection Progress</p>
          <span className="text-sm text-muted-foreground">
            {stats.earned} / {stats.total} badges
          </span>
        </div>
        <Progress value={stats.percent} className="h-3" />
      </motion.div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>✨</span> Earned Badges ({earned.length})
          </h2>
          <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {earned.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <BadgeCard badge={badge} size="md" showLabel={true} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rarity Breakdown */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {(['Common', 'Rare', 'Epic', 'Legendary'] as const).map((rarity) => {
          const rarityBadges = grouped[rarity];
          const earnedCount = rarityBadges.filter((b) => b.earned).length;

          return (
            <div key={rarity}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className={`text-lg ${
                  rarity === 'Common' ? 'text-gray-500' :
                  rarity === 'Rare' ? 'text-blue-500' :
                  rarity === 'Epic' ? 'text-purple-500' :
                  'text-yellow-500'
                }`}>
                  {rarity === 'Common' ? '⚪' :
                   rarity === 'Rare' ? '🔵' :
                   rarity === 'Epic' ? '🟣' :
                   '⭐'}
                </span>
                {rarity} ({earnedCount}/{rarityBadges.length})
              </h3>

              <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {rarityBadges.map((badge, idx) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <BadgeCard badge={badge} size="md" showLabel={true} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Locked Badges Section */}
      {unearned.length > 0 && (
        <motion.div
          className="rounded-lg border border-border bg-muted/30 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span>🔒</span> Locked Badges ({unearned.length})
          </h3>
          <div className="grid gap-6 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {unearned.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="opacity-40 grayscale"
              >
                <BadgeCard badge={badge} size="md" showLabel={false} />
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Complete more actions and milestones to unlock these badges!
          </p>
        </motion.div>
      )}

      <LevelUpAnimation />
      <AchievementUnlockedModal />
    </div>
  );
}
