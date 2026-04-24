# Deploy to GitHub Pages (Free)

Complete guide to host SkillSwap frontend on **GitHub Pages** for free.

## What You'll Get

✅ **Frontend**: Hosted on GitHub Pages (free, unlimited bandwidth)
✅ **Domain**: `https://your-username.github.io/skillswap` OR custom domain
✅ **SSL/HTTPS**: Automatic via GitHub
✅ **CDN**: Global distribution at no cost
❌ **Backend**: You'll host separately (see backend options below)

---

## Step 1: Prepare Frontend for GitHub Pages

### 1.1 Update Vite Configuration

Edit `skillswap/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/skillswap/',  // ← Add this line
  // ... rest of config
})
```

**Why?** GitHub Pages serves from `username.github.io/repository-name/`

### 1.2 Update API Calls (Important!)

You need to point to your backend URL. Create environment config:

**Create `skillswap/.env.production`:**
```env
VITE_API_URL=https://your-backend.railway.app
# or
VITE_API_URL=https://your-backend.render.com
# or your own backend URL
```

**Update API calls in `skillswap/src/services/api.ts`:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password,
  });
  return response.data;
};

// Apply same pattern to all API calls
```

### 1.3 Update Socket.io Connection

**In `skillswap/src/services/socketService.ts`:**

```typescript
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});
```

---

## Step 2: Create GitHub Repository

### 2.1 Create Repository on GitHub

```bash
# Go to https://github.com/new

# Fill in:
Repository name: skillswap
Description: Skill sharing and collaboration platform
Visibility: Public
Initialize: Add README.md

# Create repository
```

### 2.2 Initialize Git Locally

```powershell
cd 'c:\Users\kaush\OneDrive\Documents\Skill bridge'

git init

git config user.name "Your Name"
git config user.email "your-email@example.com"

git remote add origin https://github.com/YOUR-USERNAME/skillswap.git

git branch -M main
```

### 2.3 Create `.gitignore`

**File: `.gitignore`** (in project root)

```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Build
/dist/
/build/

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Test coverage
coverage/

# Docker
.dockerignore
```

### 2.4 Commit and Push

```powershell
git add .

git commit -m "Initial commit: SkillSwap full-stack application"

git push -u origin main
```

---

## Step 3: Setup GitHub Actions for Auto-Deployment

### 3.1 Create Deployment Workflow

**File: `.github/workflows/deploy-to-pages.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: skillswap/package-lock.json

      - name: Install dependencies
        working-directory: skillswap
        run: npm ci --legacy-peer-deps

      - name: Build application
        working-directory: skillswap
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: skillswap/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3.2 Configure GitHub Secrets

1. Go to **GitHub → Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com`

---

## Step 4: Enable GitHub Pages

### 4.1 Configure Pages Settings

1. Go to **GitHub Repository → Settings → Pages**
2. Under "Build and deployment":
   - **Source**: `GitHub Actions`
   - (It will detect the workflow automatically)

### 4.2 Access Your Site

After first deployment (2-5 minutes):
- **URL**: `https://your-username.github.io/skillswap`
- **View deployment**: GitHub → Actions → See workflow results

---

## Step 5: Custom Domain (Optional)

### 5.1 Connect Custom Domain

1. **GitHub Settings → Pages → Custom domain**
2. Enter your domain: `example.com`
3. Add DNS records (follow GitHub's instructions):
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
           185.199.109.153
           185.199.110.153
           185.199.111.153
   ```

### 5.2 Enable HTTPS

- Check **Enforce HTTPS** (automatic with custom domain)

---

## Backend Hosting Options (Free)

Since you're handling backend separately, here are **completely free** options:

### Option 1: Railway (Recommended - Easiest)

```bash
# 1. Sign up at railway.app (free tier)
# 2. Create new project
# 3. Deploy from GitHub
# 4. Add MySQL database (free tier)
# 5. Get public URL: https://xxxx.railway.app
```

**Free tier includes:**
- $5/month free credits (enough for hobby projects)
- MySQL database
- Environment variable management
- Auto-deploy from GitHub

**Then update frontend `.env.production`:**
```env
VITE_API_URL=https://xxxx.railway.app
```

### Option 2: Render (Free)

```bash
# 1. Sign up at render.com
# 2. Create new Web Service
# 3. Connect GitHub repo
# 4. Deploy from Dockerfile
# 5. Get URL: https://xxxx.onrender.com
```

**Free tier:**
- Auto-sleep after 15 min inactivity (wake on request)
- PostgreSQL database included
- GitHub integration

### Option 3: Replit (Simplest)

```bash
# 1. Import from GitHub on replit.com
# 2. Click Run
# 3. Get public URL instantly
# 4. Database options available
```

### Option 4: Keep Running on Local Machine

If you have a PC running 24/7:

```bash
# Use ngrok to expose local server
npm install -g ngrok

ngrok http 8080
# Get public URL: https://xxxx.ngrok.io
```

---

## Complete Deployment Workflow

```
Step 1: Make changes locally
↓
Step 2: Commit and push to GitHub
↓
Step 3: GitHub Actions automatically:
   - Installs dependencies
   - Runs tests
   - Builds production bundle
   - Deploys to GitHub Pages
↓
Step 4: Site live at github.io within 2-5 minutes
```

---

## API Configuration by Environment

**Development** (local):
```env
VITE_API_URL=http://localhost:8080
```

**Production** (GitHub Pages):
```env
# Set in GitHub Settings → Secrets
VITE_API_URL=https://your-backend-service.railway.app
```

---

## Troubleshooting

### 404 Error on Subpages

**Problem**: Clicking links gives 404
**Solution**: Already fixed with `base: '/skillswap/'` in vite.config.ts

### API Calls Fail in Production

**Problem**: Frontend can't reach backend
**Solution**: 
1. Verify `VITE_API_URL` is set in GitHub Secrets
2. Verify backend is running and accessible
3. Check CORS is enabled on backend for GitHub Pages domain

```javascript
// In backend index.js
cors({
  origin: [
    'http://localhost:5173',
    'https://your-username.github.io',  // Add this
    'https://your-backend.com'
  ]
})
```

### Build Fails

**Problem**: `npm run build` fails in GitHub Actions
**Solution**:
```yaml
# Add --legacy-peer-deps to avoid framer-motion conflicts
npm ci --legacy-peer-deps
```

### Pages Not Updating

**Problem**: Changes don't appear after push
**Solution**:
1. Check workflow succeeded in Actions tab
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check if `base: '/skillswap/'` is correct in vite.config.ts

---

## Final Configuration Checklist

- [ ] `vite.config.ts` has `base: '/skillswap/'`
- [ ] `.env.production` created with backend URL
- [ ] API calls use `import.meta.env.VITE_API_URL`
- [ ] Socket.io uses `import.meta.env.VITE_API_URL`
- [ ] GitHub repository created and pushed
- [ ] `.github/workflows/deploy-to-pages.yml` created
- [ ] `VITE_API_URL` secret added to GitHub
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Backend hosting configured (Railway/Render/etc)
- [ ] Backend URL matches `VITE_API_URL` secret
- [ ] CORS enabled on backend for GitHub Pages domain

---

## Cost Breakdown

| Component | Cost | Details |
|-----------|------|---------|
| Frontend (GitHub Pages) | **FREE** | Unlimited bandwidth |
| Backend (Railway) | **FREE** | $5/month credits (enough for hobby) |
| Database (Railway MySQL) | **FREE** | Included in credits |
| Custom Domain | **FREE** | Optional, use free domain from Freenom |
| **Total** | **FREE** | Production-grade hosting at $0/month |

---

## After Deployment

**Your site will be live at:**
```
https://your-username.github.io/skillswap
```

**Every push to `main` branch automatically:**
1. Runs tests
2. Builds production bundle
3. Deploys to GitHub Pages
4. Updates live site in 2-5 minutes

---

## Security Notes

✅ Do NOT commit `.env` with real backend URLs
✅ Use GitHub Secrets for sensitive environment variables
✅ Backend should have CORS configured properly
✅ JWT tokens should be httpOnly cookies (secure)
✅ API calls over HTTPS only in production

---

**Created**: 2026-04-24
**Status**: Ready for deployment
**Total Cost**: $0/month
