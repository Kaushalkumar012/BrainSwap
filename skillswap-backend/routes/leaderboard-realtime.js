const router = require('express').Router();
const auth = require('../middleware/auth');
const LeaderboardService = require('../services/leaderboardService');
const AchievementService = require('../services/achievementService');

// GET /api/leaderboard-realtime/overall — Overall leaderboard
router.get('/overall', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const leaderboard = await LeaderboardService.getOverallLeaderboard(limit, offset);

    res.json({
      type: 'overall',
      leaderboard,
      total: leaderboard.length,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/leaderboard-realtime/weekly — Weekly leaderboard
router.get('/weekly', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const leaderboard = await LeaderboardService.getWeeklyLeaderboard(limit, offset);

    res.json({
      type: 'weekly',
      leaderboard,
      total: leaderboard.length,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/leaderboard-realtime/highest-rated — Highest rated users
router.get('/highest-rated', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const leaderboard = await LeaderboardService.getHighestRatedLeaderboard(limit, offset);

    res.json({
      type: 'highest_rated',
      leaderboard,
      total: leaderboard.length,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/leaderboard-realtime/rising-stars — Rising stars (XP this week)
router.get('/rising-stars', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const leaderboard = await LeaderboardService.getRisingStarsLeaderboard(limit, offset);

    res.json({
      type: 'rising_stars',
      leaderboard,
      total: leaderboard.length,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/leaderboard-realtime/my-position — Get authenticated user's position
router.get('/my-position', auth, async (req, res) => {
  try {
    const position = await LeaderboardService.getUserLeaderboardPosition(req.user.id);

    if (!position) {
      return res.status(404).json({ message: 'User not found in leaderboard' });
    }

    res.json(position);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/leaderboard-realtime/user/:userId — Get specific user's position
router.get('/user/:userId', async (req, res) => {
  try {
    const position = await LeaderboardService.getUserLeaderboardPosition(req.params.userId);

    if (!position) {
      return res.status(404).json({ message: 'User not found in leaderboard' });
    }

    res.json(position);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/leaderboard-realtime/refresh-cache — Manually refresh leaderboard cache
router.post('/refresh-cache', async (req, res) => {
  try {
    const count = await LeaderboardService.updateLeaderboardCache();

    res.json({
      message: 'Leaderboard cache refreshed',
      usersUpdated: count,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
