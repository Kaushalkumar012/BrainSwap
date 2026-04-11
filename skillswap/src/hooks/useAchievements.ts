import { useMemo } from 'react';
import { useGamificationStore } from '@/store/gamificationStore';

/**
 * Hook to get organized achievement data
 */
export function useAchievements() {
  const { achievements, achievementCompletionPercent } = useGamificationStore();

  const grouped = useMemo(() => {
    const groups = {
      Progression: achievements.filter((a) => a.type === 'Progression'),
      Challenge: achievements.filter((a) => a.type === 'Challenge'),
      'Time-based': achievements.filter((a) => a.type === 'Time-based'),
      Relationship: achievements.filter((a) => a.type === 'Relationship'),
      Collaboration: achievements.filter((a) => a.type === 'Collaboration'),
      Performance: achievements.filter((a) => a.type === 'Performance'),
    };

    return groups;
  }, [achievements]);

  const stats = useMemo(() => {
    const completed = achievements.filter((a) => a.is_completed).length;
    const total = achievements.length;

    return {
      completed,
      total,
      percent: achievementCompletionPercent,
    };
  }, [achievements, achievementCompletionPercent]);

  return {
    achievements,
    grouped,
    stats,
  };
}
