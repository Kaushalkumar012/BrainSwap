const db = require('../db');

/**
 * AI Chatbot handler with streaming responses
 */
class BotHandler {
  constructor(io) {
    this.io = io;
    this.botResponses = new Map(); // userId -> botConversation
  }

  /**
   * Handle user message to chatbot
   */
  async onBotMessage(socket, data) {
    const { message, context } = data;

    if (!message?.trim()) {
      return socket.emit('bot:error', { message: 'Empty message' });
    }

    try {
      // Get user data for context
      const [userRows] = await db.query(
        `SELECT id, name, email FROM users WHERE id = ?`,
        [socket.userId]
      );

      if (!userRows.length) {
        return socket.emit('bot:error', { message: 'User not found' });
      }

      const user = userRows[0];

      // Generate bot response
      const response = await this.generateResponse(
        message,
        user,
        context
      );

      // Stream response word by word for real-time feel
      await this.streamResponse(socket, response);

      // Save bot conversation to history
      await this.saveBotMessage(socket.userId, message, response);

    } catch (err) {
      console.error('Bot error:', err);
      socket.emit('bot:error', { message: 'Failed to generate response' });
    }
  }

  /**
   * Generate bot response based on message
   */
  async generateResponse(message, user, context = {}) {
    const lowerMessage = message.toLowerCase();

    // Smart response matching
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      return this.getSkillResponse(user, context);
    }

    if (lowerMessage.includes('match') || lowerMessage.includes('find')) {
      return this.getMatchResponse(user, context);
    }

    if (lowerMessage.includes('session') || lowerMessage.includes('meeting')) {
      return this.getSessionResponse(user, context);
    }

    if (lowerMessage.includes('rate') || lowerMessage.includes('rating')) {
      return this.getRatingResponse(user, context);
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `👋 नमस्ते ${user.name}! How can I help you today with your skill exchange journey?`;
    }

    if (lowerMessage.includes('help')) {
      return this.getHelpResponse(user);
    }

    // Default response
    return `I'm here to help with your skills, matches, sessions, and more! Ask me about anything related to SkillSwap. 😊`;
  }

  /**
   * Get response for skill-related questions
   */
  async getSkillResponse(user, context) {
    const [skills] = await db.query(
      'SELECT * FROM skills WHERE user_id = ?',
      [user.id]
    );

    if (skills.length === 0) {
      return `You haven't added any skills yet! Start by adding skills you can teach or want to learn. This helps us find better matches for you. 🎯`;
    }

    const skillList = skills.map((s) => `${s.name} (${s.type})`).join(', ');
    return `Great! You have these skills: ${skillList}. Keep adding more to expand your network! 🚀`;
  }

  /**
   * Get response for match-related questions
   */
  async getMatchResponse(user, context) {
    const [matches] = await db.query(
      'SELECT COUNT(*) as count FROM matches WHERE user_id = ? OR matched_user_id = ?',
      [user.id, user.id]
    );

    const count = matches[0]?.count || 0;
    if (count === 0) {
      return `You don't have any matches yet. Add your skills to get matched with people who share your learning goals! 🤝`;
    }

    return `Amazing! You have ${count} skill matches! Check them out and start conversations with people who share your interests. 💬`;
  }

  /**
   * Get response for session-related questions
   */
  async getSessionResponse(user, context) {
    const [sessions] = await db.query(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = ? OR match_id IN (SELECT id FROM matches WHERE user_id = ?)',
      [user.id, user.id]
    );

    const count = sessions[0]?.count || 0;
    if (count === 0) {
      return `No active sessions yet. Connect with a match and schedule your first skill exchange session! 📅`;
    }

    return `You have ${count} session${count > 1 ? 's' : ''}! Keep learning and growing your skills. 📈`;
  }

  /**
   * Get response for rating-related questions
   */
  async getRatingResponse(user, context) {
    const [ratings] = await db.query(
      'SELECT AVG(rating) as avg FROM ratings WHERE user_id = ?',
      [user.id]
    );

    const avgRating = ratings[0]?.avg || 0;
    if (avgRating === 0) {
      return `You haven't been rated yet. Complete more sessions to earn ratings from peers! ⭐`;
    }

    return `Your average rating is ${avgRating.toFixed(1)}/5 ⭐! Keep delivering great sessions to maintain your reputation.`;
  }

  /**
   * Get help message
   */
  getHelpResponse(user) {
    return `Here's what I can help with:
1. **Skills** - Ask about your skills, adding more, learning new ones
2. **Matches** - Find people with matching interests
3. **Sessions** - Schedule and manage skill exchange sessions
4. **Ratings** - Check your ratings and feedback
5. **Profile** - Update your profile info

Just ask me anything! 😊`;
  }

  /**
   * Stream response word by word
   */
  async streamResponse(socket, response) {
    const words = response.split(' ');
    let accumulated = '';

    for (const word of words) {
      accumulated += (accumulated ? ' ' : '') + word;

      socket.emit('bot:response', {
        text: word,
        fullText: accumulated,
        isComplete: false,
      });

      // Simulate streaming delay (20ms per word)
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    // Final complete message
    socket.emit('bot:response', {
      text: '',
      fullText: accumulated,
      isComplete: true,
    });
  }

  /**
   * Save bot conversation
   */
  async saveBotMessage(userId, message, response) {
    try {
      await db.query(
        'INSERT INTO bot_conversations (user_id, user_message, bot_response) VALUES (?, ?, ?)',
        [userId, message, response]
      );
    } catch (err) {
      console.warn('Failed to save bot conversation:', err);
    }
  }

  /**
   * Clear bot conversation history
   */
  async onBotClear(socket) {
    try {
      await db.query(
        'DELETE FROM bot_conversations WHERE user_id = ?',
        [socket.userId]
      );

      socket.emit('bot:cleared', { message: 'Conversation cleared' });
    } catch (err) {
      socket.emit('bot:error', { message: 'Failed to clear conversation' });
    }
  }
}

module.exports = BotHandler;
