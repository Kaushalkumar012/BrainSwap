import { useEffect } from 'react';
import { useGamificationStore } from '@/store/gamificationStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

/**
 * Hook to fetch and manage leaderboard data
 */
export function useLeaderboard() {
  const { token } = useAuthStore();
  const {
    overallLeaderboard,
    weeklyLeaderboard,
    highestRatedLeaderboard,
    risingStarsLeaderboard,
    activeLeaderboardTab,
    userLeaderboardPosition,
    setLeaderboard,
    setActiveLeaderboardTab,
    setUserLeaderboardPosition,
  } = useGamificationStore();

  // Fetch leaderboard data based on active tab
  useEffect(() => {
    if (!token) return;

    const fetchLeaderboard = async () => {
      try {
        const endpoint = `/leaderboard-realtime/${activeLeaderboardTab}`;
        const res = await api.get(endpoint, {
          params: { limit: 50, offset: 0 },
        });

        setLeaderboard(activeLeaderboardTab, res.data.leaderboard);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };

    fetchLeaderboard();
  }, [token, activeLeaderboardTab, setLeaderboard]);

  // Fetch user's position
  useEffect(() => {
    if (!token) return;

    const fetchUserPosition = async () => {
      try {
        const res = await api.get('/leaderboard-realtime/my-position');
        setUserLeaderboardPosition(res.data);
      } catch (err) {
        console.error('Error fetching user position:', err);
      }
    };

    fetchUserPosition();
  }, [token, setUserLeaderboardPosition]);

  // Get active leaderboard based on tab
  const activeLeaderboard =
    activeLeaderboardTab === 'overall'
      ? overallLeaderboard
      : activeLeaderboardTab === 'weekly'
        ? weeklyLeaderboard
        : activeLeaderboardTab === 'highest-rated'
          ? highestRatedLeaderboard
          : risingStarsLeaderboard;

  return {
    activeLeaderboard,
    activeLeaderboardTab,
    setActiveLeaderboardTab,
    userLeaderboardPosition,
  };
}
