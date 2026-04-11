const db = require('../db');

/**
 * Badge system service
 * Handles badge checking, awarding, and user badge management
 */
class BadgeService {
  /**
   * Get all available badges
   */
  static async getAllBadges() {
    try {
      const [badges] = await db.query('SELECT * FROM badges ORDER BY id');
      return badges;
    } catch (err) {
      console.error('Error getting badges:', err);
      throw err;
    }
  }

  /**
   * Get user's earned badges
   */
  static async getUserBadges(userId) {
    try {
      const [badges] = await db.query(
        `SELECT b.*, ub.earned_at
         FROM badges b
         INNER JOIN user_badges ub ON b.id = ub.badge_id
         WHERE ub.user_id = ?
         ORDER BY ub.earned_at DESC`,
        [userId]
      );

      return badges;
    } catch (err) {
      console.error('Error getting user badges:', err);
      throw err;
    }
  }

  /**
   * Check and award badges based on user actions
   */
  static async checkAndAwardBadges(userId, triggerType, triggerValue) {
    try {
      const newBadges = [];

      // Get all badges that match this trigger type
      const [badges] = await db.query(
        `SELECT * FROM badges 
         WHERE condition_type = ?`,
        [triggerType]
      );

      for (const badge of badges) {
        // Check if user already has this badge
        const [existing] = await db.query(
          'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
          [userId, badge.id]
        );

        if (existing.length === 0 && triggerValue >= badge.condition_value) {
          // Award badge
          await db.query(
            'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
            [userId, badge.id]
          );

          newBadges.push({
            id: badge.id,
            name: badge.name,
            icon_emoji: badge.icon_emoji,
            description: badge.description,
            points_reward: badge.points_reward,
            rarity: badge.rarity,
          });
        }
      }

      return newBadges;
    } catch (err) {
      console.error('Error checking/awarding badges:', err);
      throw err;
    }
  }

  /**
   * Get badge by ID
   */
  static async getBadgeById(badgeId) {
    try {
      const [badges] = await db.query(
        'SELECT * FROM badges WHERE id = ?',
        [badgeId]
      );

      return badges[0] || null;
    } catch (err) {
      console.error('Error getting badge:', err);
      throw err;
    }
  }

  /**
   * Get badge earning statistics
   */
  static async getBadgeStats() {
    try {
      const [stats] = await db.query(
        `SELECT b.name, COUNT(ub.id) as earned_count, b.rarity
         FROM badges b
         LEFT JOIN user_badges ub ON b.id = ub.badge_id
         GROUP BY b.id
         ORDER BY earned_count DESC`
      );

      return stats;
    } catch (err) {
      console.error('Error getting badge stats:', err);
      throw err;
    }
  }

  /**
   * Get user's badge count
   */
  static async getUserBadgeCount(userId) {
    try {
      const [result] = await db.query(
        'SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?',
        [userId]
      );

      return result[0].count;
    } catch (err) {
      console.error('Error getting badge count:', err);
      throw err;
    }
  }

  /**
   * Check if user has specific badge
   */
  static async userHasBadge(userId, badgeId) {
    try {
      const [result] = await db.query(
        'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
        [userId, badgeId]
      );

      return result.length > 0;
    } catch (err) {
      console.error('Error checking user badge:', err);
      throw err;
    }
  }
}

module.exports = BadgeService;
