const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const XPService = require('../services/xpService');
const BadgeService = require('../services/badgeService');

// GET /api/gamification/stats — Get user's gamification stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, level, total_xp, current_xp, rating, total_sessions FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const xpStats = await XPService.getXPStats(req.user.id);
    const badgeCount = await BadgeService.getUserBadgeCount(req.user.id);

    res.json({
      level: xpStats.level,
      totalXP: xpStats.totalXP,
      currentXP: xpStats.currentXP,
      nextLevelXP: xpStats.nextLevelXP,
      progressPercent: xpStats.progressPercent,
      badgeCount,
      rating: user.rating,
      totalSessions: user.total_sessions,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/gamification/xp-history — Get user's XP transaction history
router.get('/xp-history', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const history = await XPService.getXPHistory(req.user.id, limit);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/gamification/badges — Get user's earned badges
router.get('/badges', auth, async (req, res) => {
  try {
    const badges = await BadgeService.getUserBadges(req.user.id);

    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/gamification/all-badges — Get all available badges
router.get('/all-badges', auth, async (req, res) => {
  try {
    const allBadges = await BadgeService.getAllBadges();

    // Get user's earned badges
    const userBadges = await BadgeService.getUserBadges(req.user.id);
    const userBadgeIds = new Set(userBadges.map((b) => b.id));

    // Combine data
    const badgesWithStatus = allBadges.map((badge) => ({
      ...badge,
      earned: userBadgeIds.has(badge.id),
    }));

    res.json(badgesWithStatus);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/gamification/achievements — Get user's achievement progress
router.get('/achievements', auth, async (req, res) => {
  try {
    const [achievements] = await db.query(
      `SELECT a.*, ua.progress, ua.is_completed, ua.completed_at
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
       ORDER BY a.id`,
      [req.user.id]
    );

    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/gamification/achievement/:id — Get specific achievement
router.get('/achievement/:id', auth, async (req, res) => {
  try {
    const [achievements] = await db.query(
      `SELECT a.*, ua.progress, ua.is_completed, ua.completed_at
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
       WHERE a.id = ?`,
      [req.user.id, req.params.id]
    );

    if (!achievements.length) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    res.json(achievements[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/gamification/completion-stats — Get achievement completion stats
router.get('/completion-stats', auth, async (req, res) => {
  try {
    const AchievementService = require('../services/achievementService');

    const completed = await AchievementService.getCompletedAchievementCount(req.user.id);
    const percent = await AchievementService.getAchievementCompletionPercent(req.user.id);

    res.json({
      completed,
      completionPercent: percent,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
