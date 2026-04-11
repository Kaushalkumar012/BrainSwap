const router = require('express').Router();
const {
  addClient,
  removeClient,
  initStream,
  verifyToken,
} = require('../lib/realtime');

router.get('/stream', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const user = verifyToken(token);
    initStream(res);
    addClient(user.id, res);
    res.write(`event: ready\ndata: ${JSON.stringify({ userId: user.id })}\n\n`);

    req.on('close', () => {
      removeClient(user.id, res);
      res.end();
    });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
