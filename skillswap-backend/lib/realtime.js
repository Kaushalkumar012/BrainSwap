const jwt = require('jsonwebtoken');

const clients = new Map();

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function addClient(userId, res) {
  const existing = clients.get(userId) || new Set();
  existing.add(res);
  clients.set(userId, existing);
}

function removeClient(userId, res) {
  const existing = clients.get(userId);
  if (!existing) return;

  existing.delete(res);
  if (existing.size === 0) {
    clients.delete(userId);
  }
}

function emitToUser(userId, event, payload) {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of userClients) {
    client.write(data);
  }
}

function initStream(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write('retry: 3000\n\n');
}

module.exports = {
  addClient,
  removeClient,
  emitToUser,
  initStream,
  verifyToken,
};
