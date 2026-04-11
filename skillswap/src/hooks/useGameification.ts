import { useEffect } from 'react';
import { useGamificationStore } from '@/store/gamificationStore';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/services/socketService';
import api from '@/services/api';

/**
 * Hook to initialize and manage gamification data
 */
export function useGameification() {
  const { token } = useAuthStore();
  const {
    userStats,
    setUserStats,
    setAchievements,
    setBadges,
    setAchievementCompletionPercent,
  } = useGamificationStore();

  // Fetch initial gamification data
  useEffect(() => {
    if (!token) return;

    const fetchGamificationData = async () => {
      try {
        // Fetch user stats
        const statsRes = await api.get('/gamification/stats');
        setUserStats(statsRes.data);

        // Fetch achievements
        const achievementsRes = await api.get('/gamification/achievements');
        setAchievements(achievementsRes.data);

        // Fetch badges
        const badgesRes = await api.get('/gamification/all-badges');
        setBadges(badgesRes.data);

        // Fetch completion percentage
        const completionRes = await api.get('/gamification/completion-stats');
        setAchievementCompletionPercent(completionRes.data.completionPercent);
      } catch (err) {
        console.error('Error fetching gamification data:', err);
      }
    };

    fetchGamificationData();
  }, [token, setUserStats, setAchievements, setBadges, setAchievementCompletionPercent]);

  // Listen for real-time gamification events
  useEffect(() => {
    if (!token) return;

    const unsubscribeXPGain = socketService.on('gamification:xp_gained', (data) => {
      useGamificationStore.getState().updateXPGain(data.xpAmount);
    });

    const unsubscribeLevelUp = socketService.on('gamification:level_up', (data) => {
      useGamificationStore.getState().showLevelUp(data.newLevel);
      // Auto-hide after 3 seconds
      setTimeout(() => {
        useGamificationStore.getState().hideLevelUp();
      }, 3000);
    });

    const unsubscribeBadge = socketService.on('gamification:badge_earned', (data) => {
      useGamificationStore.getState().showBadgeEarned({
        id: data.badgeId,
        name: data.name,
        description: data.description,
        icon_emoji: data.emoji,
        rarity: data.rarity,
        points_reward: data.pointsReward,
        earned: true,
        earned_at: new Date().toISOString(),
      });

      // Auto-hide after 4 seconds
      setTimeout(() => {
        useGamificationStore.getState().hideBadgeEarned();
      }, 4000);
    });

    const unsubscribeAchievement = socketService.on('gamification:achievement_unlocked', (data) => {
      useGamificationStore.getState().showAchievementUnlock({
        id: data.achievementId,
        name: data.name,
        description: data.description,
        type: '',
        target_value: 0,
        xp_reward: data.xpReward,
        progress: 0,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });
    });

    return () => {
      // Cleanup listeners
      if (typeof unsubscribeXPGain === 'function') unsubscribeXPGain();
      if (typeof unsubscribeLevelUp === 'function') unsubscribeLevelUp();
      if (typeof unsubscribeBadge === 'function') unsubscribeBadge();
      if (typeof unsubscribeAchievement === 'function') unsubscribeAchievement();
    };
  }, [token]);

  return {
    userStats,
  };
}
