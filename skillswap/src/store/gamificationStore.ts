import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  avatar?: string;
  level: number;
  score: number;
  rating: number;
  totalSessions: number;
  totalXP: number;
  badgeCount: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  target_value: number;
  xp_reward: number;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon_emoji: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  points_reward: number;
  earned: boolean;
  earned_at?: string;
}

interface UserStats {
  level: number;
  totalXP: number;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
  badgeCount: number;
  rating: number;
  totalSessions: number;
}

interface GamificationState {
  // User stats
  userStats: UserStats | null;
  userLeaderboardPosition: LeaderboardEntry | null;

  // Leaderboards
  overallLeaderboard: LeaderboardEntry[];
  weeklyLeaderboard: LeaderboardEntry[];
  highestRatedLeaderboard: LeaderboardEntry[];
  risingStarsLeaderboard: LeaderboardEntry[];
  activeLeaderboardTab: 'overall' | 'weekly' | 'highest-rated' | 'rising-stars';

  // Achievements & Badges
  achievements: Achievement[];
  badges: Badge[];
  achievementCompletionPercent: number;

  // UI State
  showLevelUpModal: boolean;
  showAchievementModal: boolean;
  showBadgeToast: boolean;
  pendingLevelUp?: { newLevel: number };
  pendingAchievement?: Achievement;
  pendingBadge?: Badge;

  // Actions
  setUserStats: (stats: UserStats) => void;
  setUserLeaderboardPosition: (position: LeaderboardEntry | null) => void;
  setLeaderboard: (type: 'overall' | 'weekly' | 'highest-rated' | 'rising-stars', data: LeaderboardEntry[]) => void;
  setActiveLeaderboardTab: (tab: 'overall' | 'weekly' | 'highest-rated' | 'rising-stars') => void;
  setAchievements: (achievements: Achievement[]) => void;
  setBadges: (badges: Badge[]) => void;
  setAchievementCompletionPercent: (percent: number) => void;
  addBadgeEarned: (badge: Badge) => void;
  completeAchievement: (achievementId: number) => void;
  
  // UI Actions
  showLevelUp: (newLevel: number) => void;
  hideLevelUp: () => void;
  showAchievementUnlock: (achievement: Achievement) => void;
  hideAchievementUnlock: () => void;
  showBadgeEarned: (badge: Badge) => void;
  hideBadgeEarned: () => void;

  // Real-time updates
  updateXPGain: (xpAmount: number) => void;
  updateLeaderboardRank: (newRank: number) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set) => ({
      // Initial state
      userStats: null,
      userLeaderboardPosition: null,
      overallLeaderboard: [],
      weeklyLeaderboard: [],
      highestRatedLeaderboard: [],
      risingStarsLeaderboard: [],
      activeLeaderboardTab: 'overall',
      achievements: [],
      badges: [],
      achievementCompletionPercent: 0,
      showLevelUpModal: false,
      showAchievementModal: false,
      showBadgeToast: false,
      pendingLevelUp: undefined,
      pendingAchievement: undefined,
      pendingBadge: undefined,

      // Actions
      setUserStats: (stats) => set({ userStats: stats }),
      
      setUserLeaderboardPosition: (position) =>
        set({ userLeaderboardPosition: position }),
      
      setLeaderboard: (type, data) => {
        const updates: Partial<GamificationState> = {};
        switch (type) {
          case 'overall':
            updates.overallLeaderboard = data;
            break;
          case 'weekly':
            updates.weeklyLeaderboard = data;
            break;
          case 'highest-rated':
            updates.highestRatedLeaderboard = data;
            break;
          case 'rising-stars':
            updates.risingStarsLeaderboard = data;
            break;
        }
        set(updates);
      },

      setActiveLeaderboardTab: (tab) =>
        set({ activeLeaderboardTab: tab }),

      setAchievements: (achievements) =>
        set({ achievements }),

      setBadges: (badges) =>
        set({ badges }),

      setAchievementCompletionPercent: (percent) =>
        set({ achievementCompletionPercent: percent }),

      addBadgeEarned: (badge) =>
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === badge.id ? { ...b, earned: true, earned_at: new Date().toISOString() } : b
          ),
        })),

      completeAchievement: (achievementId) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId
              ? { ...a, is_completed: true, completed_at: new Date().toISOString() }
              : a
          ),
        })),

      // UI Actions
      showLevelUp: (newLevel) =>
        set({ showLevelUpModal: true, pendingLevelUp: { newLevel } }),

      hideLevelUp: () =>
        set({ showLevelUpModal: false, pendingLevelUp: undefined }),

      showAchievementUnlock: (achievement) =>
        set({ showAchievementModal: true, pendingAchievement: achievement }),

      hideAchievementUnlock: () =>
        set({ showAchievementModal: false, pendingAchievement: undefined }),

      showBadgeEarned: (badge) =>
        set({ showBadgeToast: true, pendingBadge: badge }),

      hideBadgeEarned: () =>
        set({ showBadgeToast: false, pendingBadge: undefined }),

      // Real-time updates
      updateXPGain: (xpAmount) =>
        set((state) => {
          if (!state.userStats) return {};
          const newCurrentXP = state.userStats.currentXP + xpAmount;
          const progressPercent = Math.round((newCurrentXP / state.userStats.nextLevelXP) * 100);
          return {
            userStats: {
              ...state.userStats,
              totalXP: state.userStats.totalXP + xpAmount,
              currentXP: newCurrentXP,
              progressPercent,
            },
          };
        }),

      updateLeaderboardRank: (newRank) =>
        set((state) => ({
          userLeaderboardPosition: state.userLeaderboardPosition
            ? { ...state.userLeaderboardPosition, rank: newRank }
            : null,
        })),
    }),
    { name: 'skillswap-gamification' }
  )
);
