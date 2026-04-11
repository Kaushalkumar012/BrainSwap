import { motion } from 'framer-motion';
import { useLevelProgress } from '@/hooks/useLevelProgress';
import './gamification.css';

interface LevelProgressBarProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Level progress bar component showing XP progression to next level
 */
export function LevelProgressBar({ showLabel = true, size = 'md' }: LevelProgressBarProps) {
  const { level, progressPercent, xpInCurrentLevel, xpForCurrentLevel } = useLevelProgress();

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const labelSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">⭐</span>
            <span className={`font-semibold ${labelSize[size]}`}>Level {level}</span>
          </div>
          <span className={`text-muted-foreground ${labelSize[size]}`}>
            {xpInCurrentLevel.toLocaleString()} / {xpForCurrentLevel.toLocaleString()} XP
          </span>
        </div>
      )}

      <div className={`relative w-full rounded-full bg-muted overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold">{progressPercent}%</span>
        </div>
      )}
    </div>
  );
}
