<div align="center">

<br/>

<img width="90" src="https://raw.githubusercontent.com/Kaushalkumar012/BrainSwap/main/skillswap/public/vite.svg" />

# BRAIN SWAP

### **Exchange skills. Grow together. For free.**

*A full-stack peer-to-peer skill exchange platform where you teach what you know and learn what you want.*

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)

<br/>

![License](https://img.shields.io/badge/license-MIT-2ac7b6?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)
![Hackathon](https://img.shields.io/badge/Built%20for-Hackathon-ff7a59?style=flat-square)
![Stars](https://img.shields.io/github/stars/Kaushalkumar012/BrainSwap?style=flat-square&color=yellow)

</div>

---

<div align="center">

> 💡 *"I'll teach you React if you teach me UI/UX Design"* — that's BRAIN SWAP.

</div>

---

## 📸 Platform Screenshots

<div align="center">

| 🔐 Login | 🏠 Dashboard | 🤝 Matches |
|:---:|:---:|:---:|
| ![Login](./screenshots/login.png) | ![Dashboard](./screenshots/dashboard.png) | ![Matches](./screenshots/matches.png) |

| 💬 Messages | 📅 Sessions | 🚀 Collabs |
|:---:|:---:|:---:|
| ![Messages](./screenshots/messages.png) | ![Sessions](./screenshots/sessions.png) | ![Collabs](./screenshots/collabs.png) |

| 🏆 Leaderboard | 👤 Profile | 🤖 Chatbot |
|:---:|:---:|:---:|
| ![Leaderboard](./screenshots/leaderboard.png) | ![Profile](./screenshots/profile.png) | ![Chatbot](./screenshots/chatbot.png) |

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Register, Login, OAuth (Google & GitHub) |
| 👤 **Profile** | Edit name, bio, location, upload/remove profile picture |
| 🤝 **Smart Matching** | Auto-matched with users based on skill overlap & compatibility score |
| 💬 **Real-time Chat** | Socket.io powered messaging with live updates, typing indicators & presence |
| 📅 **Sessions** | Schedule, accept, reject and mark sessions as complete |
| 🚀 **Collab Board** | Post projects, find collaborators, manage join requests |
| ⭐ **Ratings** | Rate peers after completed sessions with star ratings & feedback |
| 🏆 **Leaderboard** | Real-time leaderboard ranked by XP, sessions & rating score |
| 🎖️ **Badges** | Earn badges for milestones like first session, top rated, and more |
| 🏅 **Achievements** | Unlock achievements as you grow on the platform |
| 🎮 **Gamification** | XP system, level progression, level-up animations & badge toasts |
| 🔔 **Real-time Notifications** | Live in-app notifications via Socket.io |
| 🤖 **AI Chatbot** | Built-in Hindi/English floating assistant — no external API required |
| 🌙 **Dark / Light Mode** | Full theme support across all pages |
| 🔍 **Skill Search** | Filter matches by name, location or skill |
| 📊 **Activity Feed** | Real-time recent activity on your dashboard |

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 19 + TypeScript | Component-based UI |
| Vite | Lightning-fast dev server & build |
| Tailwind CSS v4 | Utility-first styling |
| Zustand | Lightweight state management |
| React Router v7 | Client-side routing |
| Shadcn/ui | Accessible UI components |
| Socket.io Client | Real-time communication |
| Axios | HTTP client |
| date-fns | Date formatting |
| Built-in Rule Engine | Powers the Hindi/English AI chatbot (no external API) |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.io | Real-time WebSocket server |
| MySQL2 | Relational database |
| JWT | Stateless authentication |
| Bcrypt | Password hashing |
| CORS | Cross-origin resource sharing |

---

## 📁 Project Structure

```
BrainSwap/
├── skillswap/                        # Frontend (React + TypeScript)
│   └── src/
│       ├── pages/                    # Dashboard, Profile, Matches, Messages,
│       │                             # Sessions, Ratings, Collabs, Leaderboard,
│       │                             # Achievements, Badges
│       ├── components/
│       │   ├── layout/               # AppLayout, AppSidebar
│       │   ├── shared/               # UserAvatar, ChatBot, StarRating,
│       │   │                         # ThemeToggle, RealtimeNotifications
│       │   └── gamification/         # BadgeCard, AchievementCard,
│       │                             # LevelProgressBar, LevelUpAnimation,
│       │                             # BadgeEarnedToast, AchievementUnlockedModal
│       ├── hooks/                    # useSocket, useBadges, useAchievements,
│       │                             # useLeaderboard, useLevelProgress
│       ├── services/                 # API + socket service files (axios)
│       ├── store/                    # Zustand stores (auth + app + gamification)
│       └── types/                    # TypeScript interfaces
│
└── skillswap-backend/                # Backend (Node.js + Express)
    ├── routes/                       # auth, skills, matches, sessions, messages,
    │                                 # ratings, collabs, leaderboard, gamification,
    │                                 # presence, realtime
    ├── services/                     # achievementService, badgeService,
    │                                 # xpService, gamificationTrigger,
    │                                 # leaderboardService
    ├── socket/                       # socketHandler, chatHandler, botHandler,
    │                                 # presenceHandler, gamificationHandler
    ├── middleware/                   # JWT auth middleware
    ├── utils/                        # generateMatches helper
    ├── schema.sql                    # Full database schema
    ├── seed.js                       # Demo data seeder
    └── index.js                      # Entry point
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MySQL (via XAMPP, MySQL Workbench, or local install)

### 1. Clone the repository

```bash
git clone https://github.com/Kaushalkumar012/BrainSwap.git
cd BrainSwap
```

### 2. Setup the Backend

```bash
cd skillswap-backend
npm install
```

Create a `.env` file inside `skillswap-backend/`:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=skillswap
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Create the database and run the schema:

```bash
mysql -u root -p < schema.sql
```

Seed with demo data:

```bash
npm run seed
```

Start the backend:

```bash
node index.js
# ✅ MySQL connected
# 🚀 Server running on http://localhost:8080
```

### 3. Setup the Frontend

```bash
cd skillswap
npm install
npm run dev
```

### 4. Open in browser

```
http://localhost:5173
```

---

## 👥 Demo Accounts

> All demo accounts use the password: **`password123`**

| Name | Email | Offers | Wants |
|---|---|---|---|
| Aarav Patel | aarav.patel@example.com | React, JS, Node.js | Python, ML |
| Priya Sharma | priya.sharma@example.com | Figma, UI/UX | React |
| Rahul Singh | rahul.singh@example.com | Java, Spring Boot | Node.js |
| Ananya Bose | ananya.bose@example.com | Python, ML, TensorFlow | JavaScript |
| Vikram Desai | vikram.desai@example.com | Docker, Kubernetes, AWS | React |
| Neha Reddy | neha.reddy@example.com | Vue, TypeScript | JavaScript |
| Arjun Mehta | arjun.mehta@example.com | AWS, Cloud Architecture | React |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/oauth` | OAuth login (Google/GitHub) |
| PATCH | `/api/auth/profile` | Update profile |

### Core
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/skills` | Get or add skills |
| DELETE | `/api/skills/:id` | Remove a skill |
| GET | `/api/matches` | Get smart matches |
| PATCH | `/api/matches/:id` | Update match status |
| GET/POST | `/api/sessions` | Get or create sessions |
| PATCH | `/api/sessions/:id` | Update session status |
| GET | `/api/messages/conversations` | Get conversations |
| GET/POST | `/api/messages/:userId` | Get thread / send message |
| GET/POST | `/api/ratings` | Get or submit ratings |

### Extended Features
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/collabs` | Get all collab posts |
| GET | `/api/collabs/mine` | Get my posts |
| POST | `/api/collabs` | Create a post |
| PATCH | `/api/collabs/:id/status` | Open/close post |
| DELETE | `/api/collabs/:id` | Delete post |
| GET/POST | `/api/collabs/:id/requests` | Get or send join requests |
| PATCH | `/api/collabs/requests/:id` | Accept/reject request |
| GET | `/api/leaderboard` | Get top users by score |

### Gamification
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/gamification/profile` | Get XP, level & progress |
| GET | `/api/gamification/badges` | Get earned badges |
| GET | `/api/gamification/achievements` | Get unlocked achievements |
| GET | `/api/leaderboard/realtime` | Real-time leaderboard |

### Real-time (Socket.io Events)
| Event | Direction | Description |
|---|---|---|
| `join` | Client → Server | Join user room |
| `message:send` | Client → Server | Send a chat message |
| `message:receive` | Server → Client | Receive a chat message |
| `presence:online` | Server → Client | User came online |
| `presence:offline` | Server → Client | User went offline |
| `typing:start` / `typing:stop` | Client ↔ Server | Typing indicators |
| `badge:earned` | Server → Client | Badge unlock notification |
| `achievement:unlocked` | Server → Client | Achievement unlock notification |
| `xp:gained` | Server → Client | XP gain event |
| `level:up` | Server → Client | Level up event |

---

## 🏆 Leaderboard Scoring

```
Score = (Rating × 20) + Total Sessions Completed + XP Bonus
```

Complete more sessions, earn badges, and maintain a high rating to climb the leaderboard!

---

## 🎮 Gamification System

BrainSwap includes a full XP & leveling system to keep you motivated.

- **XP** earned for: completing sessions, receiving ratings, sending messages, joining collabs
- **Levels** — progress bar shown on dashboard, level-up animation on milestone
- **Badges** — milestone rewards (e.g. First Session, Top Rated, Collab King)
- **Achievements** — multi-step goals tracked over time
- **Toast notifications** — instant feedback when you earn a badge or unlock an achievement

**Pages:** `Achievements.tsx`, `Badges.tsx`
**Components:** `skillswap/src/components/gamification/`

---

## 🤖 AI Chatbot

BrainSwap includes a fully built-in floating chatbot — **no external AI API required**.

- Responds in **Hindi + English (Hinglish)**
- Aware of your live data: skills, active matches, session count
- Covers: Skills, Matches, Sessions, Messages, Ratings, Profile, Collab Board
- Quick-reply buttons for common questions
- Typing indicator, minimize/close, auto-scroll
- Accessible via the floating button (bottom-right) on every page after login

**Component:** `skillswap/src/components/shared/ChatBot.tsx`
**Integrated in:** `skillswap/src/components/layout/AppLayout.tsx`

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Made by RunTimeError

**[⭐ Star this repo](https://github.com/Kaushalkumar012/BrainSwap)** if you found it useful!

</div>
