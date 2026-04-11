require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const db = require('./db');

// Socket handlers
const { initializeSocketHandlers } = require('./socket/socketHandler');
const ChatHandler = require('./socket/chatHandler');
const BotHandler = require('./socket/botHandler');
const PresenceHandler = require('./socket/presenceHandler');
const GamificationHandler = require('./socket/gamificationHandler');
const LeaderboardService = require('./services/leaderboardService');
const AchievementService = require('./services/achievementService');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: /^http:\/\/localhost(:\d+)?$/, credentials: true },
  transports: ['websocket', 'polling'],
});

app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/, credentials: true }));
app.use(express.json());

// REST API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/presence', require('./routes/presence'));
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/collabs', require('./routes/collabs'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/leaderboard-realtime', require('./routes/leaderboard-realtime'));
app.use('/api/gamification', require('./routes/gamification'));

app.get('/', (req, res) => res.send('BRAIN SWAP API is running. Frontend: http://localhost:5173'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', socketIO: true }));

const PORT = process.env.PORT || 8080;

db.getConnection()
  .then((conn) => {
    conn.release();
    console.log('✅ MySQL connected');

    // Initialize Socket.io handlers
    const chatHandler = new ChatHandler(io);
    const botHandler = new BotHandler(io);
    const presenceHandler = new PresenceHandler(io);
    const gamificationHandler = new GamificationHandler(io);

    initializeSocketHandlers(io, {
      chat: chatHandler,
      bot: botHandler,
      presence: presenceHandler,
    });

    // Attach gamification handler to socket for manual event handling
    io.on('connection', (socket) => {
      socket.on('gamification:award_xp', (data) => gamificationHandler.onAwardXP(socket, data));
      socket.on('gamification:check_achievements', (data) => gamificationHandler.onCheckAchievements(socket, data));
      socket.on('gamification:update_leaderboard', () => gamificationHandler.onUpdateLeaderboard(socket));
    });

    // Initialize leaderboard cache update (every 5 minutes)
    LeaderboardService.schedulePeriodicUpdate(5);

    // Store services globally for access in routes
    global.leaderboardService = LeaderboardService;
    global.achievementService = AchievementService;
    global.gamificationHandler = gamificationHandler;

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.io ready for real-time connections`);
    });
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });
