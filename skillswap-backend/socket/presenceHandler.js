const db = require('../db');

/**
 * User presence and online status handler
 */
class PresenceHandler {
  constructor(io) {
    this.io = io;
    this.onlineUsers = new Map(); // userId -> Set of socketIds
    this.userSubscriptions = new Map(); // userId -> Set of subscribedUserIds
  }

  /**
   * User came online
   */
  async onUserOnline(socket) {
    const userId = socket.userId;

    // Track online user
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId).add(socket.id);

    // Notify subscribers that user is online
    const subscribersList = this.getSubscribersOfUser(userId);
    subscribersList.forEach((subscriberId) => {
      this.io.to(`user:${subscriberId}`).emit('presence:online', {
        userId,
        isOnline: true,
      });
    });

    console.log(`🟢 User ${userId} came online (${this.onlineUsers.get(userId).size} connections)`);
  }

  /**
   * User went offline
   */
  async onUserOffline(socket) {
    const userId = socket.userId;
    const connections = this.onlineUsers.get(userId);

    if (connections) {
      connections.delete(socket.id);

      // Only mark as offline if no more connections
      if (connections.size === 0) {
        this.onlineUsers.delete(userId);

        // Notify subscribers
        const subscribersList = this.getSubscribersOfUser(userId);
        subscribersList.forEach((subscriberId) => {
          this.io.to(`user:${subscriberId}`).emit('presence:offline', {
            userId,
            isOnline: false,
          });
        });

        console.log(`🔴 User ${userId} went offline`);
      }
    }
  }

  /**
   * Subscribe to user's online status
   */
  async onSubscribe(socket, data) {
    const { userIds } = data;

    if (!Array.isArray(userIds)) {
      return socket.emit('error', { message: 'userIds must be an array' });
    }

    // Store subscriptions
    if (!this.userSubscriptions.has(socket.userId)) {
      this.userSubscriptions.set(socket.userId, new Set());
    }

    const subscriptions = this.userSubscriptions.get(socket.userId);
    userIds.forEach((id) => subscriptions.add(id));

    // Send current online status for all subscribed users
    const statuses = {};
    userIds.forEach((userId) => {
      statuses[userId] = this.isUserOnline(userId);
    });

    socket.emit('presence:subscribed', { statuses });
    console.log(`👁️ User ${socket.userId} subscribed to ${userIds.length} users`);
  }

  /**
   * Unsubscribe from user's online status
   */
  onUnsubscribe(socket, data) {
    const { userIds } = data;

    const subscriptions = this.userSubscriptions.get(socket.userId);
    if (!subscriptions) return;

    userIds.forEach((id) => subscriptions.delete(id));

    socket.emit('presence:unsubscribed', { userIds });
    console.log(`👁️ User ${socket.userId} unsubscribed from ${userIds.length} users`);
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.onlineUsers.has(userId) && this.onlineUsers.get(userId).size > 0;
  }

  /**
   * Get all users who are subscribed to a specific user's status
   */
  getSubscribersOfUser(userId) {
    const subscribers = [];
    this.userSubscriptions.forEach((subscriptions, subscriberId) => {
      if (subscriptions.has(userId)) {
        subscribers.push(subscriberId);
      }
    });
    return subscribers;
  }

  /**
   * Get online status for multiple users
   */
  getOnlineStatuses(userIds) {
    const statuses = {};
    userIds.forEach((userId) => {
      statuses[userId] = this.isUserOnline(userId);
    });
    return statuses;
  }

  /**
   * Get count of online users
   */
  getOnlineCount() {
    return this.onlineUsers.size;
  }
}

module.exports = PresenceHandler;
