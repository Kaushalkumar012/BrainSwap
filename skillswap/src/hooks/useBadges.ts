import { useMemo } from 'react';
import { useGamificationStore } from '@/store/gamificationStore';

/**
 * Hook to get organized badge data
 */
export function useBadges() {
  const { badges } = useGamificationStore();

  const grouped = useMemo(() => {
    const groups = {
      Common: badges.filter((b) => b.rarity === 'Common'),
      Rare: badges.filter((b) => b.rarity === 'Rare'),
      Epic: badges.filter((b) => b.rarity === 'Epic'),
      Legendary: badges.filter((b) => b.rarity === 'Legendary'),
    };

    return groups;
  }, [badges]);

  const stats = useMemo(() => {
    const earned = badges.filter((b) => b.earned).length;
    const total = badges.length;

    return {
      earned,
      total,
      percent: Math.round((earned / total) * 100),
    };
  }, [badges]);

  const earned = useMemo(() => {
    return badges.filter((b) => b.earned);
  }, [badges]);

  const unearned = useMemo(() => {
    return badges.filter((b) => !b.earned);
  }, [badges]);

  return {
    badges,
    grouped,
    earned,
    unearned,
    stats,
  };
}
