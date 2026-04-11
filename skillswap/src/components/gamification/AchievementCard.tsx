import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Achievement } from '@/store/gamificationStore';
import './gamification.css';

interface AchievementCardProps {
  achievement: Achievement;
}

/**
 * Achievement card showing progress and completion status
 */
export function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercent = (achievement.progress / achievement.target_value) * 100;
  const isCompleted = achievement.is_completed;

  return (
    <motion.div
      className={`rounded-lg border p-4 space-y-3 ${
        isCompleted
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-background hover:border-primary/50'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <h3 className="font-semibold text-sm">{achievement.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
        </div>

        <div className="text-right shrink-0">
          <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
            isCompleted ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-primary/20 text-primary'
          }`}>
            +{achievement.xp_reward} XP
          </span>
        </div>
      </div>

      {!isCompleted && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {achievement.progress} / {achievement.target_value}
            </span>
          </div>

          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="text-xs text-muted-foreground text-right">
            {Math.round(progressPercent)}%
          </div>
        </div>
      )}

      {isCompleted && achievement.completed_at && (
        <div className="text-xs text-muted-foreground">
          Unlocked: {new Date(achievement.completed_at).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
