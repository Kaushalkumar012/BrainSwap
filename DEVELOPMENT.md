# Development Guide

Complete guide for setting up and developing the SkillSwap application locally.

## Prerequisites

- Node.js 18+ or 20+
- MySQL 8.0+
- Git
- Docker & Docker Compose (optional, for containerized development)

## Quick Start (Local Setup)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 'Skill bridge'
```

### 2. Install Dependencies

#### Backend
```bash
cd skillswap-backend
npm install
```

#### Frontend
```bash
cd ../skillswap
npm install --legacy-peer-deps
```

### 3. Setup Environment Variables

#### Backend
```bash
cd skillswap-backend
cp .env.example .env
```

Edit `.env` with your local database configuration:
```env
PORT=8080
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=skillswap
JWT_SECRET=your_development_secret_key
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

#### Frontend
No `.env` file needed for frontend in development. API calls are proxied through the Nginx configuration.

### 4. Setup MySQL Database

#### Using Local MySQL
1. Create database and schema:
```bash
mysql -u root -p < skillswap-backend/schema.sql
```

2. Seed sample data (optional):
```bash
cd skillswap-backend
npm run seed
```

#### Using Docker Compose
```bash
docker-compose up -d mysql
```

### 5. Start Development Servers

#### In separate terminal windows:

**Backend:**
```bash
cd skillswap-backend
npm run dev
```
Server runs on `http://localhost:8080`

**Frontend:**
```bash
cd skillswap
npm run dev
```
Frontend runs on `http://localhost:5173`

Access the app at `http://localhost:5173`

## Development with Docker Compose

### Start All Services
```bash
docker-compose up
```

This starts:
- **Frontend**: `http://localhost`
- **Backend**: `http://localhost:8080`
- **MySQL**: `localhost:3306`
- **Adminer** (DB management): `http://localhost:8081`

### View Logs
```bash
docker-compose logs -f [service-name]
```

### Stop Services
```bash
docker-compose down
```

### Rebuild Images
```bash
docker-compose up --build
```

## Testing

### Backend Tests

```bash
cd skillswap-backend

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Test files location: `skillswap-backend/tests/`

### Frontend Tests

```bash
cd skillswap

# Run tests
npm test

# Watch mode
npm run test:watch

# UI Dashboard
npm run test:ui

# Coverage report
npm run test:coverage
```

Test files location: `skillswap/src/__tests__/`

## Code Quality

### Linting (Backend)
```bash
cd skillswap-backend
npm run lint
```

### Linting (Frontend)
```bash
cd skillswap
npm run lint
```

### Type Checking (Frontend)
```bash
cd skillswap
npm run typecheck
```

### Code Formatting
```bash
cd skillswap
npm run format
```

## Project Structure

### Backend (`skillswap-backend/`)
```
├── config/              # Configuration management
├── middleware/          # Auth, validation, error handling
├── routes/              # REST API endpoints
├── services/            # Business logic (gamification, etc.)
├── socket/              # Real-time handlers
├── utils/               # Helper functions & logger
├── tests/               # Test suites
├── db.js                # Database connection
├── index.js             # Main server file
└── schema.sql           # Database schema
```

### Frontend (`skillswap/`)
```
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API & WebSocket services
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   ├── __tests__/       # Test suites
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── vite.config.ts       # Vite configuration
└── tailwind.config.ts   # Tailwind CSS configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

### Skills
- `GET /api/skills` - List all skills
- `POST /api/skills` - Create new skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Matches
- `GET /api/matches` - Get skill matches
- `POST /api/matches` - Create match request
- `PUT /api/matches/:id` - Update match status

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get chat history with user

### Gamification
- `GET /api/gamification/xp` - Get user XP
- `GET /api/gamification/badges` - Get earned badges
- `GET /api/gamification/achievements` - Get achievements
- `GET /api/leaderboard` - Get leaderboard

See backend routes for complete API documentation.

## Real-time Features

### Socket.io Events

The application uses Socket.io for real-time features:

**Client Events (Frontend → Backend):**
- `chat:send` - Send a message
- `presence:update` - Update user presence
- `gamification:award_xp` - Award XP points
- `gamification:check_achievements` - Check achievements

**Server Events (Backend → Frontend):**
- `chat:receive` - Receive a message
- `presence:updated` - Presence updated
- `leaderboard:updated` - Leaderboard changed
- `notification` - General notification

## Debugging

### Backend Logging
Check logs in `skillswap-backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

### Frontend Console
Open browser DevTools console for frontend logs.

### Database Queries
Enable detailed logging by setting `LOG_LEVEL=debug` in backend `.env`.

## Common Issues & Solutions

### Port Already in Use
```bash
# Backend (port 8080)
# Find and kill process
lsof -i :8080
kill -9 <PID>

# Frontend (port 5173)
lsof -i :5173
kill -9 <PID>
```

### MySQL Connection Failed
- Ensure MySQL is running
- Check credentials in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues
```bash
# Clean up
docker-compose down -v

# Rebuild everything
docker-compose up --build
```

## Performance Tips

1. **Frontend**: Use React DevTools Profiler to identify slow components
2. **Backend**: Enable query logging to optimize database queries
3. **Database**: Add indexes for frequently queried columns
4. **Caching**: Leverage Redis for session and leaderboard caching

## Security Best Practices

- ✅ Never commit `.env` files with real secrets
- ✅ Keep dependencies updated: `npm audit`
- ✅ Use HTTPS in production
- ✅ Validate all user inputs on both client and server
- ✅ Use parameterized queries for database operations
- ✅ Implement rate limiting for sensitive endpoints
- ✅ Rotate JWT secrets regularly

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Run linting and tests before committing
4. Commit with clear messages
5. Push and create a Pull Request
6. Ensure CI/CD checks pass

## Support

For issues and questions:
1. Check existing issues on GitHub
2. Create detailed issue with reproduction steps
3. Contact the development team

---

**Last Updated**: 2026-04-24
**Version**: 1.0.0
