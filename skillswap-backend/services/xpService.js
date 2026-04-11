const db = require('../db');

/**
 * XP & Points system service
 * Handles user progression and level calculations
 */
class XPService {
  /**
   * XP requirements for each level
   */
  static XP_PER_LEVEL = {
    1: 0,
    5: 500,
    10: 1500,
    15: 3000,
    20: 5000,
    25: 7500,
    30: 10000,
    40: 25000,
    50: 50000,
  };

  /**
   * Get XP required for a specific level
   */
  static getXPForLevel(level) {
    const xpTable = this.XP_PER_LEVEL;
    for (let i = level; i >= 1; i--) {
      if (xpTable[i]) return xpTable[i];
    }
    return 0;
  }

  /**
   * Award XP to a user and handle level up
   */
  static async awardXP(userId, actionType, xpAmount, reason) {
    try {
      // Get current user stats
      const [users] = await db.query(
        'SELECT level, total_xp, current_xp FROM users WHERE id = ?',
        [userId]
      );

      if (!users.length) {
        throw new Error('User not found');
      }

      const user = users[0];
      let newCurrentXP = user.current_xp + xpAmount;
      let newLevel = user.level;
      let leveledUp = false;

      // Check for level up
      const nextLevelXP = this.getXPForLevel(user.level + 1);
      if (newCurrentXP >= nextLevelXP) {
        newLevel = user.level + 1;
        newCurrentXP = newCurrentXP - nextLevelXP;
        leveledUp = true;
      }

      // Update user XP and level
      await db.query(
        'UPDATE users SET total_xp = total_xp + ?, current_xp = ?, level = ? WHERE id = ?',
        [xpAmount, newCurrentXP, newLevel, userId]
      );

      // Log XP transaction
      await db.query(
        'INSERT INTO user_xp_log (user_id, action_type, xp_amount, reason) VALUES (?, ?, ?, ?)',
        [userId, actionType, xpAmount, reason]
      );

      return {
        xpAwarded: xpAmount,
        newTotalXP: user.total_xp + xpAmount,
        newCurrentXP,
        newLevel,
        leveledUp,
      };
    } catch (err) {
      console.error('Error awarding XP:', err);
      throw err;
    }
  }

  /**
   * Get user XP stats
   */
  static async getXPStats(userId) {
    try {
      const [users] = await db.query(
        'SELECT level, total_xp, current_xp FROM users WHERE id = ?',
        [userId]
      );

      if (!users.length) {
        throw new Error('User not found');
      }

      const user = users[0];
      const nextLevelXP = this.getXPForLevel(user.level + 1);
      const currentLevelXP = this.getXPForLevel(user.level);
      const xpToNextLevel = nextLevelXP - user.current_xp;
      const xpInCurrentLevel = user.current_xp;
      const xpForCurrentLevel = nextLevelXP - currentLevelXP;

      return {
        level: user.level,
        totalXP: user.total_xp,
        currentXP: user.current_xp,
        nextLevelXP,
        xpToNextLevel,
        xpInCurrentLevel,
        xpForCurrentLevel,
        progressPercent: Math.round((xpInCurrentLevel / xpForCurrentLevel) * 100),
      };
    } catch (err) {
      console.error('Error getting XP stats:', err);
      throw err;
    }
  }

  /**
   * Get XP transaction history
   */
  static async getXPHistory(userId, limit = 20) {
    try {
      const [logs] = await db.query(
        `SELECT * FROM user_xp_log 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );

      return logs;
    } catch (err) {
      console.error('Error getting XP history:', err);
      throw err;
    }
  }

  /**
   * Calculate user score for leaderboard
   * Score = (Rating × 20) + Total Sessions + (Level × 10)
   */
  static async calculateUserScore(userId) {
    try {
      const [users] = await db.query(
        `SELECT u.rating, u.total_sessions, u.level
         FROM users u
         WHERE u.id = ?`,
        [userId]
      );

      if (!users.length) {
        throw new Error('User not found');
      }

      const user = users[0];
      const rating = user.rating || 0;
      const sessions = user.total_sessions || 0;
      const level = user.level || 1;

      const score = (rating * 20) + sessions + (level * 10);

      return Math.round(score);
    } catch (err) {
      console.error('Error calculating score:', err);
      throw err;
    }
  }
}

module.exports = XPService;
