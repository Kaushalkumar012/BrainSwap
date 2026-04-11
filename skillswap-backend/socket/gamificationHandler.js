const XPService = require('../services/xpService');
const BadgeService = require('../services/badgeService');

/**
 * Gamification handler for Socket.io events
 * Handles real-time XP awards, badge notifications, and level ups
 */
class GamificationHandler {
  constructor(io) {
    this.io = io;
  }

  /**
   * Award XP to a user and emit real-time events
   */
  async onAwardXP(socket, data) {
    const { actionType, xpAmount, reason } = data;

    if (!actionType || !xpAmount) {
      return socket.emit('error', { message: 'Invalid XP award data' });
    }

    try {
      // Award XP
      const xpResult = await XPService.awardXP(
        socket.userId,
        actionType,
        xpAmount,
        reason
      );

      // Emit XP gained event
      this.io.to(`user:${socket.userId}`).emit('gamification:xp_gained', {
        xpAmount,
        totalXP: xpResult.newTotalXP,
        currentXP: xpResult.newCurrentXP,
        level: xpResult.newLevel,
      });

      // Check for level up
      if (xpResult.leveledUp) {
        this.io.to(`user:${socket.userId}`).emit('gamification:level_up', {
          newLevel: xpResult.newLevel,
          levelUpMessage: `🚀 Level Up! You've reached Level ${xpResult.newLevel}!`,
        });
      }

      // Check for badge awards
      const newBadges = await BadgeService.checkAndAwardBadges(
        socket.userId,
        actionType,
        xpAmount
      );

      if (newBadges.length > 0) {
        newBadges.forEach((badge) => {
          this.io.to(`user:${socket.userId}`).emit('gamification:badge_earned', {
            badgeId: badge.id,
            name: badge.name,
            emoji: badge.icon_emoji,
            description: badge.description,
            rarity: badge.rarity,
            pointsReward: badge.points_reward,
          });
        });
      }

      console.log(`✨ User ${socket.userId} earned ${xpAmount} XP (${actionType})`);
    } catch (err) {
      console.error('Error awarding XP:', err);
      socket.emit('error', { message: 'Failed to award XP' });
    }
  }

  /**
   * Check and notify achievements
   */
  async onCheckAchievements(socket, data) {
    const { achievementType, progress } = data;

    if (!achievementType) {
      return socket.emit('error', { message: 'Invalid achievement data' });
    }

    try {
      // Get user's achievement progress
      const achievements = await this.getUserAchievements(socket.userId);

      const relevantAchievements = achievements.filter(
        (a) => a.type === achievementType
      );

      const unlockedAchievements = [];

      for (const achievement of relevantAchievements) {
        if (!achievement.is_completed && progress >= achievement.target_value) {
          // Mark as completed
          await this.completeAchievement(socket.userId, achievement.id);

          unlockedAchievements.push({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            xpReward: achievement.xp_reward,
          });

          // Emit achievement unlocked
          this.io.to(`user:${socket.userId}`).emit('gamification:achievement_unlocked', {
            achievementId: achievement.id,
            name: achievement.name,
            description: achievement.description,
            xpReward: achievement.xp_reward,
            message: `✨ Achievement Unlocked! "${achievement.name}"`,
          });
        }
      }

      console.log(`🎯 User ${socket.userId} unlocked ${unlockedAchievements.length} achievements`);
    } catch (err) {
      console.error('Error checking achievements:', err);
      socket.emit('error', { message: 'Failed to check achievements' });
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId) {
    const db = require('../db');
    const [achievements] = await db.query(
      `SELECT a.*, ua.progress, ua.is_completed
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
       ORDER BY a.id`,
      [userId]
    );

    return achievements;
  }

  /**
   * Complete achievement for user
   */
  async completeAchievement(userId, achievementId) {
    const db = require('../db');
    await db.query(
      `UPDATE user_achievements 
       SET is_completed = TRUE, completed_at = NOW()
       WHERE user_id = ? AND achievement_id = ?`,
      [userId, achievementId]
    );
  }

  /**
   * Update leaderboard
   */
  async onUpdateLeaderboard(socket) {
    try {
      const leaderboard = await this.getTopLeaderboard(10);

      // Emit leaderboard update to all users
      this.io.emit('gamification:leaderboard_updated', {
        leaderboard,
        timestamp: new Date().toISOString(),
      });

      console.log('📊 Leaderboard updated');
    } catch (err) {
      console.error('Error updating leaderboard:', err);
    }
  }

  /**
   * Get top users for leaderboard
   */
  async getTopLeaderboard(limit = 10) {
    const db = require('../db');
    const [users] = await db.query(
      `SELECT u.id, u.name, u.avatar, u.rating, u.total_sessions, u.level, u.total_xp,
              (u.rating * 20 + u.total_sessions + u.level * 10) as score
       FROM users u
       ORDER BY score DESC
       LIMIT ?`,
      [limit]
    );

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      score: user.score,
      rating: parseFloat(user.rating),
      totalSessions: user.total_sessions,
      totalXP: user.total_xp,
    }));
  }

  /**
   * Initialize achievement tracking for new user
   */
  async initializeUserAchievements(userId) {
    const db = require('../db');

    // Get all achievements
    const [achievements] = await db.query('SELECT id FROM achievements');

    // Create user achievement records
    for (const achievement of achievements) {
      await db.query(
        `INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed)
         VALUES (?, ?, 0, FALSE)`,
        [userId, achievement.id]
      );
    }

    console.log(`📋 Initialized ${achievements.length} achievements for user ${userId}`);
  }
}

module.exports = GamificationHandler;
