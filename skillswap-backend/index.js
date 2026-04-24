require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const db = require('./db');
const logger = require('./utils/logger');
const config = require('./config');

// Middleware
const { helmetMiddleware, authLimiter, apiLimiter } = require('./middleware/securityMiddleware');
const { errorHandler } = require('./middleware/errorHandler');

// Socket handlers
const { initializeSocketHandlers } = require('./socket/socketHandler');
const ChatHandler = require('./socket/chatHandler');
const BotHandler = require('./socket/botHandler');
const PresenceHandler = require('./socket/presenceHandler');
const GamificationHandler = require('./socket/gamificationHandler');
const CallHandler = require('./socket/callHandler');
const LeaderboardService = require('./services/leaderboardService');
const AchievementService = require('./services/achievementService');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: config.security.corsOrigin, credentials: true },
  transports: ['websocket', 'polling'],
});

// Security Middleware
if (config.security.enableHelmet) {
  app.use(helmetMiddleware);
}

// CORS Configuration
app.use(cors({ origin: config.security.corsOrigin, credentials: true }));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging (Morgan)
const morganFormat = config.NODE_ENV === 'production'
  ? 'combined'
  : ':method :url :status :res[content-length] - :response-time ms';

app.use(morgan(morganFormat, {
  skip: (req) => config.NODE_ENV === 'test',
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Rate limiting
if (config.security.enableRateLimit) {
  app.use(apiLimiter);
}

// REST API Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SkillSwap API is running',
    frontend: 'http://localhost:5173',
    environment: config.NODE_ENV,
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    socketIO: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

const PORT = config.PORT;

// Database initialization and server startup
db.getConnection()
  .then((conn) => {
    conn.release();
    logger.info('✅ MySQL connected successfully');

    // Initialize Socket.io handlers
    const chatHandler = new ChatHandler(io);
    const botHandler = new BotHandler(io);
    const presenceHandler = new PresenceHandler(io);
    const gamificationHandler = new GamificationHandler(io);
    const callHandler = new CallHandler(io);

    initializeSocketHandlers(io, {
      chat: chatHandler,
      bot: botHandler,
      presence: presenceHandler,
      call: callHandler,
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
    const server = httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🔌 Socket.io ready for real-time connections`);
      logger.info(`📊 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        io.close(() => {
          logger.info('Socket.io connections closed');
          
          db.end(() => {
            logger.info('Database connections closed');
            process.exit(0);
          });
        });
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Uncaught exception handler
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      gracefulShutdown('uncaughtException');
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  })
  .catch((err) => {
    logger.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });
