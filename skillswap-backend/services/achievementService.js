const db = require('../db');

/**
 * Achievement tracking service
 * Handles achievement progress, triggers, and completion
 */
class AchievementService {
  /**
   * Update achievement progress for a user
   */
  static async updateAchievementProgress(userId, achievementType, progressValue) {
    try {
      // Get achievements of this type
      const [achievements] = await db.query(
        'SELECT * FROM achievements WHERE type = ?',
        [achievementType]
      );

      const newlyCompleted = [];

      for (const achievement of achievements) {
        // Get or create user achievement
        const [existing] = await db.query(
          'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
          [userId, achievement.id]
        );

        if (existing.length === 0) {
          // Create new achievement record
          await db.query(
            'INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed) VALUES (?, ?, ?, FALSE)',
            [userId, achievement.id, Math.min(progressValue, achievement.target_value)]
          );
        } else {
          const ua = existing[0];

          // Skip if already completed
          if (ua.is_completed) continue;

          // Update progress
          const newProgress = Math.min(progressValue, achievement.target_value);
          await db.query(
            'UPDATE user_achievements SET progress = ? WHERE user_id = ? AND achievement_id = ?',
            [newProgress, userId, achievement.id]
          );

          // Check if completed
          if (newProgress >= achievement.target_value && !ua.is_completed) {
            // Mark as completed
            await db.query(
              'UPDATE user_achievements SET is_completed = TRUE, completed_at = NOW() WHERE user_id = ? AND achievement_id = ?',
              [userId, achievement.id]
            );

            newlyCompleted.push({
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              xpReward: achievement.xp_reward,
              type: achievement.type,
            });
          }
        }
      }

      return newlyCompleted;
    } catch (err) {
      console.error('Error updating achievement progress:', err);
      throw err;
    }
  }

  /**
   * Get user's achievement progress
   */
  static async getUserAchievements(userId) {
    try {
      const [achievements] = await db.query(
        `SELECT a.*, ua.progress, ua.is_completed, ua.completed_at
         FROM achievements a
         LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
         ORDER BY a.id`,
        [userId]
      );

      return achievements;
    } catch (err) {
      console.error('Error getting user achievements:', err);
      throw err;
    }
  }

  /**
   * Trigger achievement checks on session completion
   */
  static async checkSessionAchievements(userId) {
    try {
      const [sessions] = await db.query(
        'SELECT COUNT(*) as count FROM sessions WHERE (requester_id = ? OR participant_id = ?) AND status = "completed"',
        [userId, userId]
      );

      const sessionCount = sessions[0].count;

      // Update Progression type achievements
      return await this.updateAchievementProgress(userId, 'Progression', sessionCount);
    } catch (err) {
      console.error('Error checking session achievements:', err);
      throw err;
    }
  }

  /**
   * Trigger achievement checks on rating received
   */
  static async checkRatingAchievements(userId) {
    try {
      // Get average rating
      const [ratings] = await db.query(
        'SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE to_user_id = ?',
        [userId]
      );

      const avgRating = ratings[0].avg || 0;

      // Check Perfect Score achievement (5-star rating)
      if (avgRating >= 5) {
        return await this.updateAchievementProgress(userId, 'Challenge', 1);
      }

      // Check Rating Climber achievement
      if (avgRating > 0) {
        return await this.updateAchievementProgress(userId, 'Performance', Math.ceil(avgRating));
      }

      return [];
    } catch (err) {
      console.error('Error checking rating achievements:', err);
      throw err;
    }
  }

  /**
   * Trigger achievement checks on skill added
   */
  static async checkSkillAchievements(userId) {
    try {
      const [skills] = await db.query(
        'SELECT COUNT(*) as count FROM skills WHERE user_id = ?',
        [userId]
      );

      const skillCount = skills[0].count;

      // Update Progression type achievements
      return await this.updateAchievementProgress(userId, 'Progression', skillCount);
    } catch (err) {
      console.error('Error checking skill achievements:', err);
      throw err;
    }
  }

  /**
   * Trigger achievement checks on match/relationship
   */
  static async checkRelationshipAchievements(userId) {
    try {
      const [matches] = await db.query(
        'SELECT COUNT(DISTINCT CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END) as count FROM matches WHERE (user1_id = ? OR user2_id = ?) AND status = "active"',
        [userId, userId, userId]
      );

      const matchCount = matches[0].count;

      // Update Relationship type achievements
      return await this.updateAchievementProgress(userId, 'Relationship', matchCount);
    } catch (err) {
      console.error('Error checking relationship achievements:', err);
      throw err;
    }
  }

  /**
   * Check daily login achievement
   */
  static async checkDailyLoginAchievement(userId) {
    try {
      // Get achievements of type Time-based
      const [achievements] = await db.query(
        'SELECT * FROM achievements WHERE type = "Time-based"'
      );

      const newlyCompleted = [];

      for (const achievement of achievements) {
        const [ua] = await db.query(
          'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
          [userId, achievement.id]
        );

        if (ua.length === 0) {
          // Create record with progress 1 (1 day login)
          await db.query(
            'INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed) VALUES (?, ?, 1, FALSE)',
            [userId, achievement.id]
          );
        } else {
          const record = ua[0];

          if (record.is_completed) continue;

          // Increment progress (simulate consecutive days)
          const newProgress = Math.min(record.progress + 1, achievement.target_value);

          await db.query(
            'UPDATE user_achievements SET progress = ? WHERE user_id = ? AND achievement_id = ?',
            [newProgress, userId, achievement.id]
          );

          // Check if completed
          if (newProgress >= achievement.target_value) {
            await db.query(
              'UPDATE user_achievements SET is_completed = TRUE, completed_at = NOW() WHERE user_id = ? AND achievement_id = ?',
              [userId, achievement.id]
            );

            newlyCompleted.push({
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              xpReward: achievement.xp_reward,
            });
          }
        }
      }

      return newlyCompleted;
    } catch (err) {
      console.error('Error checking daily login:', err);
      throw err;
    }
  }

  /**
   * Get completed achievements count
   */
  static async getCompletedAchievementCount(userId) {
    try {
      const [result] = await db.query(
        'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = TRUE',
        [userId]
      );

      return result[0].count;
    } catch (err) {
      console.error('Error getting completed achievement count:', err);
      throw err;
    }
  }

  /**
   * Get achievement completion percentage
   */
  static async getAchievementCompletionPercent(userId) {
    try {
      const [result] = await db.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed
         FROM user_achievements
         WHERE user_id = ?`,
        [userId]
      );

      const total = result[0].total || 0;
      const completed = result[0].completed || 0;

      return total > 0 ? Math.round((completed / total) * 100) : 0;
    } catch (err) {
      console.error('Error getting achievement completion percent:', err);
      throw err;
    }
  }
}

module.exports = AchievementService;
