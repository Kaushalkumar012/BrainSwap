import { motion } from 'framer-motion';
import { Crown, Medal } from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import type { LeaderboardEntry as Entry } from '@/store/gamificationStore';
import './gamification.css';

interface LeaderboardEntryProps {
  entry: Entry;
  isCurrentUser?: boolean;
  index: number;
}

const rankBadges = {
  1: { icon: '👑', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  2: { icon: '🥈', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  3: { icon: '🥉', color: 'text-amber-600', bg: 'bg-amber-600/10' },
};

/**
 * Leaderboard entry showing user rank, level, and score
 */
export function LeaderboardEntry({ entry, isCurrentUser = false, index }: LeaderboardEntryProps) {
  const rankBadge = entry.rank <= 3 ? rankBadges[entry.rank as 1 | 2 | 3] : null;

  return (
    <motion.div
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
        isCurrentUser ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Rank */}
      <div className="w-12 shrink-0">
        {rankBadge ? (
          <div className={`flex items-center justify-center rounded-full h-10 w-10 ${rankBadge.bg}`}>
            <span className="text-lg">{rankBadge.icon}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center text-sm font-bold text-muted-foreground w-10">
            #{entry.rank}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <UserAvatar name={entry.name} avatar={entry.avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">
            {entry.name}
            {isCurrentUser && <span className="text-xs text-primary ml-2">(You)</span>}
          </p>
          <p className="text-xs text-muted-foreground">Level {entry.level}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{entry.score}</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold">{entry.totalSessions}</p>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </div>

        {entry.badgeCount > 0 && (
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold">{entry.badgeCount}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        )}

        {/* Rating stars */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold flex items-center gap-1">
            {entry.rating.toFixed(1)} <span className="text-yellow-500">★</span>
          </p>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
      </div>
    </motion.div>
  );
}
