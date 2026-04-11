const db = require('../db');

/**
 * Chat event handlers
 */
class ChatHandler {
  constructor(io) {
    this.io = io;
    this.userConversations = new Map(); // userId -> Set of conversationIds
  }

  /**
   * User joins a conversation room
   */
  async onJoinConversation(socket, data) {
    const { targetUserId } = data;
    const conversationId = this.getConversationId(socket.userId, targetUserId);

    socket.join(`conv:${conversationId}`);
    this.userConversations.set(
      socket.userId,
      (this.userConversations.get(socket.userId) || new Set()).add(conversationId)
    );

    console.log(`👤 User ${socket.userId} joined conversation ${conversationId}`);
  }

  /**
   * Send a message in a conversation
   */
  async onSendMessage(socket, data) {
    const { receiverId, message } = data;

    if (!receiverId || !message?.trim()) {
      return socket.emit('error', { message: 'Invalid message data' });
    }

    try {
      // Save to database
      const [result] = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [socket.userId, receiverId, message.trim()]
      );

      // Fetch the saved message
      const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
      const msg = rows[0];

      const messageData = {
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        message: msg.message,
        createdAt: msg.created_at,
      };

      // Emit to conversation room
      const conversationId = this.getConversationId(socket.userId, receiverId);
      this.io.to(`conv:${conversationId}`).emit('message:new', messageData);

      // Also emit to user's personal room (for multi-window support)
      this.io.to(`user:${receiverId}`).emit('message:received', {
        from: socket.userId,
        ...messageData,
      });

      console.log(`💬 Message sent: ${socket.userId} → ${receiverId}`);
    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle typing indicator
   */
  async onTyping(socket, data) {
    const { targetUserId, isTyping } = data;

    const conversationId = this.getConversationId(socket.userId, targetUserId);
    this.io.to(`conv:${conversationId}`).emit('typing:indicator', {
      userId: socket.userId,
      isTyping,
    });
  }

  /**
   * User leaves a conversation
   */
  onLeaveConversation(socket, data) {
    const { targetUserId } = data;
    const conversationId = this.getConversationId(socket.userId, targetUserId);

    socket.leave(`conv:${conversationId}`);

    const convSet = this.userConversations.get(socket.userId);
    if (convSet) {
      convSet.delete(conversationId);
    }

    console.log(`👤 User ${socket.userId} left conversation ${conversationId}`);
  }

  /**
   * Get a consistent conversation ID for two users
   */
  getConversationId(userId1, userId2) {
    return [Math.min(userId1, userId2), Math.max(userId1, userId2)].join('-');
  }
}

module.exports = ChatHandler;
