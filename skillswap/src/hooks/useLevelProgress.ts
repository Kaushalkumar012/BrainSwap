import { useGamificationStore } from '@/store/gamificationStore';

interface LevelProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
  xpForCurrentLevel: number;
  progressPercent: number;
}

/**
 * Hook to get formatted level progress data
 */
export function useLevelProgress(): LevelProgress {
  const { userStats } = useGamificationStore();

  if (!userStats) {
    return {
      level: 1,
      currentXP: 0,
      nextLevelXP: 500,
      xpToNextLevel: 500,
      xpInCurrentLevel: 0,
      xpForCurrentLevel: 500,
      progressPercent: 0,
    };
  }

  return {
    level: userStats.level,
    currentXP: userStats.currentXP,
    nextLevelXP: userStats.nextLevelXP,
    xpToNextLevel: userStats.nextLevelXP - userStats.currentXP,
    xpInCurrentLevel: userStats.currentXP,
    xpForCurrentLevel: userStats.nextLevelXP,
    progressPercent: userStats.progressPercent,
  };
}
