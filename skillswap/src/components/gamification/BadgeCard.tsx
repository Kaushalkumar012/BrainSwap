import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Badge } from '@/store/gamificationStore';
import './gamification.css';

interface BadgeCardProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const rarityColors = {
  Common: 'text-gray-500',
  Rare: 'text-blue-500',
  Epic: 'text-purple-500',
  Legendary: 'text-yellow-500',
};

const rarityBgClasses = {
  Common: 'bg-gray-500/10',
  Rare: 'bg-blue-500/10',
  Epic: 'bg-purple-500/10',
  Legendary: 'bg-yellow-500/10',
};

/**
 * Badge card component
 */
export function BadgeCard({ badge, size = 'md', showLabel = true }: BadgeCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-32 h-32 text-6xl',
  };

  const labelSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const containerVariants = {
    initial: { scale: 1, opacity: badge.earned ? 1 : 0.5 },
    hover: badge.earned ? { scale: 1.1 } : {},
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: badge.earned ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`flex flex-col items-center gap-2 cursor-pointer`}
            variants={containerVariants}
            initial="initial"
            whileHover="hover"
            transition={{ duration: 0.3 }}
          >
            <div
              className={`relative flex items-center justify-center rounded-full ${sizeClasses[size]} ${
                badge.earned ? rarityBgClasses[badge.rarity] : 'bg-gray-200 dark:bg-gray-800'
              }`}
            >
              {/* Glow effect for earned badges */}
              {badge.earned && (
                <motion.div
                  className={`absolute inset-0 rounded-full ${rarityBgClasses[badge.rarity]}`}
                  variants={glowVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <span className={badge.earned ? rarityColors[badge.rarity] : 'text-gray-400'}>
                {badge.icon_emoji}
              </span>
            </div>

            {showLabel && (
              <div className="text-center">
                <p className={`font-semibold ${labelSize[size]} line-clamp-2`}>{badge.name}</p>
                <p className={`text-xs text-muted-foreground`}>{badge.rarity}</p>
                {badge.earned && badge.earned_at && (
                  <p className="text-xs text-primary mt-1">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm text-gray-300">{badge.description}</p>
            <p className="text-xs text-yellow-400 mt-2">{badge.points_reward} points</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
