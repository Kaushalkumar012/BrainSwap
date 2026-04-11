# Real-Time Features Guide

BrainSwap now includes advanced real-time capabilities powered by **Socket.io**! This document explains how the real-time features work and how to use them.

## Architecture Overview

```
Frontend (React + Socket.io-client)
         ↕
   Socket.io Server (Express + Node.js)
         ↕
   MySQL Database (Message History & Bot Conversations)
```

## Core Real-Time Features

### 1. **Real-Time Chat** 💬
Instant message delivery between users using bidirectional WebSocket connections.

**How it works:**
- Users join a conversation room when they open a chat thread
- Messages are emitted through Socket.io and broadcast to both parties
- Messages are persisted in MySQL for history
- Typing indicators show when someone is composing

**Events:**
```javascript
// Emit
socket.emit('chat:join', { targetUserId })
socket.emit('chat:message', { receiverId, message })
socket.emit('chat:typing', { targetUserId, isTyping })
socket.emit('chat:leave', { targetUserId })

// Listen
socket.on('message:new', (message) => {})
socket.on('typing:indicator', (data) => {})
socket.on('message:received', (message) => {})
```

### 2. **Real-Time Chatbot** 🤖
Smart AI chatbot with streaming responses and context awareness.

**Features:**
- Rule-based responses with natural language understanding
- Streaming word-by-word for real-time feel
- Context-aware answers (knows about your skills, matches, sessions)
- Hindi/English (Hinglish) support
- Conversation history saved to database

**Bot Topics:**
- Skills management and recommendations
- Smart matches and compatibility
- Session scheduling and management
- Rating and feedback information
- Profile updates and profile information

**Events:**
```javascript
// Emit
socket.emit('bot:message', { message, context })
socket.emit('bot:clear')

// Listen
socket.on('bot:response', (data) => {}) // Streaming response
socket.on('bot:error', (error) => {})
socket.on('bot:cleared', (data) => {})
```

### 3. **User Presence & Online Status** 🟢
Real-time tracking of who's online and available for collaboration.

**Features:**
- Online/offline status updates
- Presence indicators on user profiles
- Active users list in conversations
- Multi-device support (user online on any device)

**Events:**
```javascript
// Emit
socket.emit('presence:subscribe', { userIds })
socket.emit('presence:unsubscribe', { userIds })

// Listen
socket.on('presence:online', (data) => {})
socket.on('presence:offline', (data) => {})
socket.on('presence:subscribed', (data) => {})
```

### 4. **Real-Time Notifications** 🔔
Instant notifications for important events across the platform.

**Events triggering notifications:**
- New messages from peers
- User comes online/goes offline
- New matches found
- Session requests received
- Rating received
- Collab request status changes

## Frontend Integration

### Using the Socket Service

```typescript
import { socketService } from '@/services/socketService';
import { useAuthStore } from '@/store/authStore';

// Initialize connection
const { token } = useAuthStore();
socketService.connect(token);

// Send message
socketService.sendMessage(receiverId, 'Hello!');

// Listen for messages
socketService.onMessage((msg) => {
  console.log('New message:', msg);
});

// Set typing indicator
socketService.setTyping(targetUserId, true);

// Bot message
socketService.sendBotMessage('What skills do I have?');

// Presence
socketService.subscribeToPresence([userId1, userId2]);
socketService.onUserOnline((data) => {
  console.log(`User ${data.userId} came online`);
});

// Disconnect
socketService.disconnect();
```

### Using React Hooks

```typescript
import { useSocket, useRealtimeChat, useRealtimeBot, usePresence } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { token } = useAuthStore();
  
  // Basic socket connection
  const socket = useSocket(token);
  
  // Real-time chat
  const chat = useRealtimeChat(targetUserId, token);
  chat.sendMessage('Hello!');
  chat.setTyping(true);
  
  // Chatbot
  const bot = useRealtimeBot(token);
  bot.sendMessage('What can you teach?');
  bot.clearConversation();
  
  // Presence tracking
  const presence = usePresence([userId1, userId2], token);
}
```

### Notification Component

The `<RealtimeNotifications />` component automatically handles all real-time events and shows toast notifications.

Add it to your layout:

```typescript
import { RealtimeNotifications } from '@/components/shared/RealtimeNotifications';

function AppLayout() {
  return (
    <>
      <RealtimeNotifications />
      {/* Rest of your app */}
    </>
  );
}
```

## Backend Integration

### Socket.io Handlers

The backend has three main handler classes:

#### ChatHandler
Manages real-time chat events and message persistence.

```javascript
// Location: skillswap-backend/socket/chatHandler.js
io.on('connection', (socket) => {
  socket.on('chat:join', (data) => { /* ... */ });
  socket.on('chat:message', (data) => { /* ... */ });
  socket.on('chat:typing', (data) => { /* ... */ });
  socket.on('chat:leave', (data) => { /* ... */ });
});
```

#### BotHandler
Generates intelligent responses and streams them in real-time.

```javascript
// Location: skillswap-backend/socket/botHandler.js
socket.on('bot:message', async (data) => {
  const response = await generateResponse(data.message, user, context);
  await streamResponse(socket, response);
});
```

#### PresenceHandler
Tracks user online/offline status and notifies subscribers.

```javascript
// Location: skillswap-backend/socket/presenceHandler.js
socket.on('presence:subscribe', (data) => {
  // Store subscriptions and send current status
});
```

### Authentication

All Socket.io connections require JWT authentication:

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = user.id;
  next();
});
```

## Database Schema

### bot_conversations Table
Stores all chatbot conversations for history and analytics.

```sql
CREATE TABLE bot_conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, created_at DESC)
);
```

## Environment Setup

### Backend (.env)
```env
PORT=8080
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=skillswap
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
```

## Running the Migration

To add real-time feature tables to your existing database:

```bash
cd skillswap-backend
node migrate-realtime.js
```

## Testing Real-Time Features

### Test Real-Time Chat
1. Open two browser windows
2. Login with different accounts
3. Navigate to Messages
4. Send a message from one window
5. See it appear instantly in the other window

### Test Chatbot
1. Open any page after login
2. Click the chatbot button (bottom-right)
3. Ask questions like:
   - "What skills do I have?"
   - "Show me my matches"
   - "How many sessions have I completed?"
4. See real-time streaming responses

### Test Presence
1. Open Messages
2. See "Active now" section updating in real-time
3. User status badges change color (green = online, gray = offline)
4. Open another window to verify multi-device support

## Performance Considerations

- **Scalability**: Socket.io supports clustering with Redis for production
- **Message History**: Messages are persisted in MySQL, not in memory
- **Presence Tracking**: Lightweight subscription model (only track interested users)
- **Bot Responses**: Streaming prevents long response wait times

## Troubleshooting

### Socket Connection Issues
```
❌ Socket.io connection fails
→ Check that backend is running on port 8080
→ Verify JWT token is valid
→ Check CORS origin in backend/index.js
```

### Missing Messages
```
❌ Messages not appearing in real-time
→ Ensure both users are in the same conversation room
→ Check browser console for socket errors
→ Verify database connection
```

### Chatbot Not Responding
```
❌ Bot doesn't respond
→ Check that bot:message event is being emitted
→ Verify user exists in database
→ Check bot response generation logic
```

## Future Enhancements

Phase 2 will add:
- Badge system with real-time notifications
- Achievement tracking and celebration animations
- Real-time leaderboard updates
- Gamification points system

Phase 3 will add:
- Voice/Video calling (WebRTC)
- Screen sharing
- Session recording

## API Reference

See the Socket.io events reference in the socket handlers:
- `skillswap-backend/socket/socketHandler.js`
- `skillswap-backend/socket/chatHandler.js`
- `skillswap-backend/socket/botHandler.js`
- `skillswap-backend/socket/presenceHandler.js`

## Support

For issues or questions about real-time features, check:
1. Browser console for errors
2. Backend logs
3. Database connection status
4. Socket.io network tab in DevTools
