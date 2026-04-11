const jwt = require('jsonwebtoken');

/**
 * Initialize Socket.io handlers
 * @param {Server} io - Socket.io server instance
 * @param {Object} handlers - Event handlers { chat, bot, presence }
 */
function initializeSocketHandlers(io, handlers) {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: no token provided'));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected via Socket.io`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // User came online
    if (handlers.presence) {
      handlers.presence.onUserOnline(socket);
    }

    // Chat events
    if (handlers.chat) {
      socket.on('chat:join', (data) => handlers.chat.onJoinConversation(socket, data));
      socket.on('chat:message', (data) => handlers.chat.onSendMessage(socket, data));
      socket.on('chat:typing', (data) => handlers.chat.onTyping(socket, data));
      socket.on('chat:leave', (data) => handlers.chat.onLeaveConversation(socket, data));
    }

    // Chatbot events
    if (handlers.bot) {
      socket.on('bot:message', (data) => handlers.bot.onBotMessage(socket, data));
      socket.on('bot:clear', () => handlers.bot.onBotClear(socket));
    }

    // Presence events
    if (handlers.presence) {
      socket.on('presence:subscribe', (data) => handlers.presence.onSubscribe(socket, data));
      socket.on('presence:unsubscribe', (data) => handlers.presence.onUnsubscribe(socket, data));
    }

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userId} disconnected`);
      if (handlers.presence) {
        handlers.presence.onUserOffline(socket);
      }
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  console.log('🔌 Socket.io initialized with all handlers');
}

module.exports = { initializeSocketHandlers };
