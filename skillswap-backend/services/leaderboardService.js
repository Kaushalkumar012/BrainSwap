const db = require('../db');
const XPService = require('./xpService');

/**
 * Leaderboard service
 * Handles leaderboard generation, caching, and real-time updates
 */
class LeaderboardService {
  /**
   * Calculate user score
   * Score = (Rating × 20) + Total Sessions + (Level × 10)
   */
  static async calculateUserScore(userId) {
    try {
      return await XPService.calculateUserScore(userId);
    } catch (err) {
      console.error('Error calculating score:', err);
      throw err;
    }
  }

  /**
   * Get overall leaderboard (all-time ranking)
   */
  static async getOverallLeaderboard(limit = 20, offset = 0) {
    try {
      const [users] = await db.query(
        `SELECT u.id, u.name, u.avatar, u.rating, u.total_sessions, u.level, u.total_xp,
                (u.rating * 20 + u.total_sessions + u.level * 10) as score,
                COUNT(DISTINCT ub.badge_id) as badge_count
         FROM users u
         LEFT JOIN user_badges ub ON u.id = ub.user_id
         GROUP BY u.id
         ORDER BY score DESC, u.total_sessions DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return users.map((user, index) => ({
        rank: offset + index + 1,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        score: user.score,
        rating: parseFloat(user.rating),
        totalSessions: user.total_sessions,
        totalXP: user.total_xp,
        badgeCount: user.badge_count,
      }));
    } catch (err) {
      console.error('Error getting overall leaderboard:', err);
      throw err;
    }
  }

  /**
   * Get weekly leaderboard (sessions completed this week)
   */
  static async getWeeklyLeaderboard(limit = 20, offset = 0) {
    try {
      const [users] = await db.query(
        `SELECT u.id, u.name, u.avatar, u.rating, u.total_sessions,
                COUNT(s.id) as sessions_this_week,
                (COUNT(s.id) * 100) as weekly_score
         FROM users u
         LEFT JOIN sessions s ON (s.requester_id = u.id OR s.participant_id = u.id) 
           AND s.status = 'completed'
           AND s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY u.id
         HAVING sessions_this_week > 0
         ORDER BY weekly_score DESC, sessions_this_week DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return users.map((user, index) => ({
        rank: offset + index + 1,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        sessionsThisWeek: user.sessions_this_week,
        weeklyScore: user.weekly_score,
        rating: parseFloat(user.rating),
        totalSessions: user.total_sessions,
      }));
    } catch (err) {
      console.error('Error getting weekly leaderboard:', err);
      throw err;
    }
  }

  /**
   * Get rating-based leaderboard
   */
  static async getHighestRatedLeaderboard(limit = 20, offset = 0) {
    try {
      const [users] = await db.query(
        `SELECT u.id, u.name, u.avatar, u.rating, u.total_sessions, u.level,
                COUNT(r.id) as rating_count
         FROM users u
         LEFT JOIN ratings r ON r.to_user_id = u.id
         GROUP BY u.id
         HAVING u.rating > 0 AND rating_count >= 5
         ORDER BY u.rating DESC, rating_count DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return users.map((user, index) => ({
        rank: offset + index + 1,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        rating: parseFloat(user.rating),
        ratingCount: user.rating_count,
        level: user.level,
        totalSessions: user.total_sessions,
      }));
    } catch (err) {
      console.error('Error getting highest rated leaderboard:', err);
      throw err;
    }
  }

  /**
   * Get rising stars leaderboard (XP gained this week)
   */
  static async getRisingStarsLeaderboard(limit = 20, offset = 0) {
    try {
      const [users] = await db.query(
        `SELECT u.id, u.name, u.avatar, u.level, u.total_xp,
                SUM(uxl.xp_amount) as xp_this_week
         FROM users u
         LEFT JOIN user_xp_log uxl ON u.id = uxl.user_id 
           AND uxl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY u.id
         HAVING xp_this_week > 0
         ORDER BY xp_this_week DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return users.map((user, index) => ({
        rank: offset + index + 1,
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        xpThisWeek: user.xp_this_week || 0,
        totalXP: user.total_xp,
      }));
    } catch (err) {
      console.error('Error getting rising stars leaderboard:', err);
      throw err;
    }
  }

  /**
   * Update leaderboard cache
   */
  static async updateLeaderboardCache() {
    try {
      // Clear existing cache
      await db.query('TRUNCATE TABLE leaderboard_cache');

      // Get overall rankings
      const leaderboard = await this.getOverallLeaderboard(1000, 0);

      // Insert into cache
      for (const entry of leaderboard) {
        await db.query(
          `INSERT INTO leaderboard_cache 
           (user_id, user_rank, score, user_level, total_xp, rating, total_sessions, badge_count)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            entry.userId,
            entry.rank,
            entry.score,
            entry.level,
            entry.totalXP,
            entry.rating,
            entry.totalSessions,
            entry.badgeCount,
          ]
        );
      }

      console.log(`📊 Leaderboard cache updated (${leaderboard.length} users)`);
      return leaderboard.length;
    } catch (err) {
      console.error('Error updating leaderboard cache:', err);
      throw err;
    }
  }

  /**
   * Get user's leaderboard position
   */
  static async getUserLeaderboardPosition(userId) {
    try {
      const [result] = await db.query(
        `SELECT u.id, u.name, u.avatar, u.level, u.total_xp, u.rating, u.total_sessions,
                (u.rating * 20 + u.total_sessions + u.level * 10) as score,
                COUNT(DISTINCT ub.badge_id) as badge_count
         FROM users u
         LEFT JOIN user_badges ub ON u.id = ub.user_id
         WHERE u.id = ?
         GROUP BY u.id`,
        [userId]
      );

      if (!result.length) {
        return null;
      }

      const user = result[0];

      // Get rank
      const [rank] = await db.query(
        `SELECT COUNT(*) as rank FROM (
          SELECT u.id FROM users u
          WHERE (u.rating * 20 + u.total_sessions + u.level * 10) > ?
         ) as ranked`,
        [user.score]
      );

      return {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        rank: rank[0].rank + 1,
        level: user.level,
        score: user.score,
        rating: parseFloat(user.rating),
        totalSessions: user.total_sessions,
        totalXP: user.total_xp,
        badgeCount: user.badge_count,
      };
    } catch (err) {
      console.error('Error getting user leaderboard position:', err);
      throw err;
    }
  }

  /**
   * Schedule periodic leaderboard cache update (call from cron job)
   */
  static schedulePeriodicUpdate(intervalMinutes = 5) {
    setInterval(() => {
      this.updateLeaderboardCache().catch((err) => {
        console.error('Error in periodic leaderboard update:', err);
      });
    }, intervalMinutes * 60 * 1000);

    console.log(`📊 Leaderboard cache will update every ${intervalMinutes} minutes`);
  }
}

module.exports = LeaderboardService;
