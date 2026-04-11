const XPService = require('./xpService');
const BadgeService = require('./badgeService');
const AchievementService = require('./achievementService');

/**
 * Gamification trigger service
 * Triggers XP awards and achievement checks on specific events
 * This is called from various routes when events occur
 */
class GamificationTrigger {
  /**
   * Trigger on session completion
   */
  static async onSessionCompleted(userId, recipientId, io) {
    try {
      // Award XP to both users
      const xpResult = await XPService.awardXP(
        userId,
        'session_completed',
        100,
        'Completed a skill exchange session'
      );

      if (recipientId && recipientId !== userId) {
        await XPService.awardXP(
          recipientId,
          'session_completed',
          100,
          'Completed a skill exchange session'
        );
      }

      // Check session achievements
      const achievements = await AchievementService.checkSessionAchievements(userId);

      if (recipientId && recipientId !== userId) {
        await AchievementService.checkSessionAchievements(recipientId);
      }

      // Check for badge awards
      const newBadges = await BadgeService.checkAndAwardBadges(
        userId,
        'sessions_completed',
        1
      );

      if (recipientId && recipientId !== userId) {
        await BadgeService.checkAndAwardBadges(recipientId, 'sessions_completed', 1);
      }

      // Emit real-time events
      if (io) {
        io.to(`user:${userId}`).emit('gamification:xp_gained', {
          xpAmount: 100,
          totalXP: xpResult.newTotalXP,
          level: xpResult.newLevel,
          reason: 'Session completed',
        });

        if (xpResult.leveledUp) {
          io.to(`user:${userId}`).emit('gamification:level_up', {
            newLevel: xpResult.newLevel,
          });
        }

        newBadges.forEach((badge) => {
          io.to(`user:${userId}`).emit('gamification:badge_earned', {
            name: badge.name,
            emoji: badge.icon_emoji,
            rarity: badge.rarity,
          });
        });
      }

      console.log(`🎮 Gamification triggered for session completion (user: ${userId})`);

      return {
        xpAwarded: 100,
        leveledUp: xpResult.leveledUp,
        badgesEarned: newBadges.length,
        achievementsCompleted: achievements.length,
      };
    } catch (err) {
      console.error('Error triggering session completion gamification:', err);
      throw err;
    }
  }

  /**
   * Trigger on rating received
   */
  static async onRatingReceived(userId, ratingValue, io) {
    try {
      // Award XP based on rating
      const xpAmount = ratingValue * 10;
      const xpResult = await XPService.awardXP(
        userId,
        'rating_received',
        xpAmount,
        `Received a ${ratingValue}-star rating`
      );

      // Check rating achievements
      const achievements = await AchievementService.checkRatingAchievements(userId);

      // Check for badge awards
      const newBadges = await BadgeService.checkAndAwardBadges(
        userId,
        'average_rating',
        Math.ceil(ratingValue * 10) // Scale to 50 for 5-star
      );

      // Emit real-time events
      if (io) {
        io.to(`user:${userId}`).emit('gamification:xp_gained', {
          xpAmount,
          totalXP: xpResult.newTotalXP,
          level: xpResult.newLevel,
          reason: `${ratingValue}-star rating received`,
        });

        if (xpResult.leveledUp) {
          io.to(`user:${userId}`).emit('gamification:level_up', {
            newLevel: xpResult.newLevel,
          });
        }

        newBadges.forEach((badge) => {
          io.to(`user:${userId}`).emit('gamification:badge_earned', {
            name: badge.name,
            emoji: badge.icon_emoji,
            rarity: badge.rarity,
          });
        });

        achievements.forEach((achievement) => {
          io.to(`user:${userId}`).emit('gamification:achievement_unlocked', {
            name: achievement.name,
            xpReward: achievement.xpReward,
          });
        });
      }

      console.log(`🎮 Gamification triggered for rating (user: ${userId}, rating: ${ratingValue})`);

      return {
        xpAwarded: xpAmount,
        leveledUp: xpResult.leveledUp,
        badgesEarned: newBadges.length,
        achievementsCompleted: achievements.length,
      };
    } catch (err) {
      console.error('Error triggering rating gamification:', err);
      throw err;
    }
  }

  /**
   * Trigger on skill added
   */
  static async onSkillAdded(userId, io) {
    try {
      // Award XP
      const xpResult = await XPService.awardXP(
        userId,
        'skill_added',
        10,
        'Added a new skill to profile'
      );

      // Check skill achievements
      const achievements = await AchievementService.checkSkillAchievements(userId);

      // Check for badge awards
      const newBadges = await BadgeService.checkAndAwardBadges(userId, 'skill_added', 1);

      // Emit real-time events
      if (io) {
        io.to(`user:${userId}`).emit('gamification:xp_gained', {
          xpAmount: 10,
          totalXP: xpResult.newTotalXP,
          level: xpResult.newLevel,
          reason: 'Skill added',
        });

        newBadges.forEach((badge) => {
          io.to(`user:${userId}`).emit('gamification:badge_earned', {
            name: badge.name,
            emoji: badge.icon_emoji,
          });
        });
      }

      console.log(`🎮 Gamification triggered for skill added (user: ${userId})`);

      return {
        xpAwarded: 10,
        badgesEarned: newBadges.length,
      };
    } catch (err) {
      console.error('Error triggering skill gamification:', err);
      throw err;
    }
  }

  /**
   * Trigger on match created/activated
   */
  static async onMatchCreated(userId, io) {
    try {
      // Award XP
      const xpResult = await XPService.awardXP(
        userId,
        'match_created',
        20,
        'Created a new skill match'
      );

      // Check relationship achievements
      const achievements = await AchievementService.checkRelationshipAchievements(userId);

      // Check for badge awards
      const newBadges = await BadgeService.checkAndAwardBadges(
        userId,
        'active_matches',
        1
      );

      // Emit real-time events
      if (io) {
        io.to(`user:${userId}`).emit('gamification:xp_gained', {
          xpAmount: 20,
          totalXP: xpResult.newTotalXP,
          level: xpResult.newLevel,
          reason: 'New skill match created',
        });

        newBadges.forEach((badge) => {
          io.to(`user:${userId}`).emit('gamification:badge_earned', {
            name: badge.name,
            emoji: badge.icon_emoji,
          });
        });
      }

      console.log(`🎮 Gamification triggered for match (user: ${userId})`);

      return {
        xpAwarded: 20,
        badgesEarned: newBadges.length,
        achievementsCompleted: achievements.length,
      };
    } catch (err) {
      console.error('Error triggering match gamification:', err);
      throw err;
    }
  }

  /**
   * Trigger daily login
   */
  static async onDailyLogin(userId, io) {
    try {
      // Award XP
      const xpResult = await XPService.awardXP(
        userId,
        'daily_login',
        5,
        'Daily login bonus'
      );

      // Check daily login achievements
      const achievements = await AchievementService.checkDailyLoginAchievement(userId);

      // Emit real-time events
      if (io) {
        io.to(`user:${userId}`).emit('gamification:xp_gained', {
          xpAmount: 5,
          totalXP: xpResult.newTotalXP,
          level: xpResult.newLevel,
          reason: 'Daily login bonus',
        });

        achievements.forEach((achievement) => {
          io.to(`user:${userId}`).emit('gamification:achievement_unlocked', {
            name: achievement.name,
            xpReward: achievement.xpReward,
          });
        });
      }

      console.log(`🎮 Gamification triggered for daily login (user: ${userId})`);

      return {
        xpAwarded: 5,
        achievementsCompleted: achievements.length,
      };
    } catch (err) {
      console.error('Error triggering daily login gamification:', err);
      throw err;
    }
  }

  /**
   * Trigger collab completion
   */
  static async onCollabCompleted(userId, io) {
    try {
      // Award XP
      const xpResult = await XPService.awardXP(
        userId,
        'collab_completed',
        100,
        'Completed a collaboration project'
      );

      // Check achievement
      const achievements = await AchievementService.updateAchievementProgress(
        userId,
        'Collaboration',
        1
      );

      // Check for badge awards
      const newBadges = await BadgeService.checkAndAwardBadges(
        userId,
        'collabs_completed',
        1
      );

      // Emit real-time events
      if (io) {
        io.to(`user:${userId}`).emit('gamification:xp_gained', {
          xpAmount: 100,
          totalXP: xpResult.newTotalXP,
          level: xpResult.newLevel,
          reason: 'Collaboration project completed',
        });

        if (xpResult.leveledUp) {
          io.to(`user:${userId}`).emit('gamification:level_up', {
            newLevel: xpResult.newLevel,
          });
        }

        newBadges.forEach((badge) => {
          io.to(`user:${userId}`).emit('gamification:badge_earned', {
            name: badge.name,
            emoji: badge.icon_emoji,
          });
        });
      }

      console.log(`🎮 Gamification triggered for collab (user: ${userId})`);

      return {
        xpAwarded: 100,
        leveledUp: xpResult.leveledUp,
        badgesEarned: newBadges.length,
        achievementsCompleted: achievements.length,
      };
    } catch (err) {
      console.error('Error triggering collab gamification:', err);
      throw err;
    }
  }
}

module.exports = GamificationTrigger;
