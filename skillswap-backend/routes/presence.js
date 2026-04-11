const router = require('express').Router();
const auth = require('../middleware/auth');
const { emitToUser } = require('../lib/realtime');

const ONLINE_TTL_MS = 45000;
const TYPING_TTL_MS = 5000;

const onlineUsers = new Map();
const typingUsers = new Map();

function pruneExpiredEntries() {
  const now = Date.now();

  for (const [userId, expiresAt] of onlineUsers.entries()) {
    if (expiresAt <= now) {
      onlineUsers.delete(userId);
    }
  }

  for (const [key, expiresAt] of typingUsers.entries()) {
    if (expiresAt <= now) {
      typingUsers.delete(key);
    }
  }
}

function parseUserIds(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isFinite(id));
}

router.post('/ping', auth, (req, res) => {
  pruneExpiredEntries();
  onlineUsers.set(req.user.id, Date.now() + ONLINE_TTL_MS);
  res.json({ ok: true });
});

router.post('/typing', auth, (req, res) => {
  pruneExpiredEntries();

  const partnerId = Number.parseInt(String(req.body.partnerId), 10);
  const isTyping = Boolean(req.body.isTyping);

  if (!Number.isFinite(partnerId)) {
    return res.status(400).json({ message: 'partnerId is required' });
  }

  const key = `${req.user.id}:${partnerId}`;

  if (isTyping) {
    typingUsers.set(key, Date.now() + TYPING_TTL_MS);
  } else {
    typingUsers.delete(key);
  }

  emitToUser(partnerId, 'typing', {
    userId: req.user.id,
    isTyping,
  });

  res.json({ ok: true });
});

router.get('/', auth, (req, res) => {
  pruneExpiredEntries();

  const requestedUserIds = parseUserIds(req.query.userIds);
  const statuses = requestedUserIds.reduce((acc, userId) => {
    acc[userId] = onlineUsers.has(userId);
    return acc;
  }, {});

  const threadUserId = Number.parseInt(String(req.query.threadUserId), 10);
  const typing = Number.isFinite(threadUserId)
    ? typingUsers.has(`${threadUserId}:${req.user.id}`)
    : false;

  res.json({
    onlineUserIds: requestedUserIds.filter((userId) => onlineUsers.has(userId)),
    statuses,
    typing,
  });
});

module.exports = router;
