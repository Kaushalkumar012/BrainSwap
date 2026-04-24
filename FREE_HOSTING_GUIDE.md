# Complete Free Hosting Guide for SkillSwap

Deploy SkillSwap **completely free** across multiple services.

---

## 🎯 Quick Overview

```
Frontend (React)  → GitHub Pages (FREE)
Backend (Express) → Railway/Render (FREE tier)
Database (MySQL)  → Railway/Render (FREE tier)
```

**Total Cost**: $0/month

---

## 🚀 Step 1: Deploy Frontend to GitHub Pages

### 1.1 Push to GitHub

```powershell
cd 'c:\Users\kaush\OneDrive\Documents\Skill bridge'

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"
git remote add origin https://github.com/YOUR-USERNAME/skillswap.git
git branch -M main

# Commit and push
git add .
git commit -m "Initial commit: SkillSwap full-stack app"
git push -u origin main
```

### 1.2 GitHub Secrets Configuration

1. Go to **GitHub.com → Your Repository → Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.railway.app
   ```
   (You'll get the URL after deploying backend)

### 1.3 Enable GitHub Pages

1. **Settings → Pages**
2. Under "Build and deployment":
   - **Source**: `GitHub Actions`
3. Visit: `https://your-username.github.io/skillswap`

✅ **Frontend deployed automatically on every push!**

---

## 🎯 Step 2: Deploy Backend & Database to Railway (Recommended)

### 2.1 Sign Up for Railway

```
1. Go to https://railway.app
2. Click "Start Project"
3. Sign up with GitHub (easiest)
4. Create new project
```

### 2.2 Add Services to Railway

**Option A: Deploy from GitHub (Recommended)**

```
1. New → GitHub Repo
2. Select your skillswap repository
3. Select "skillswap-backend" folder
4. Deploy
```

**Option B: Deploy from Docker**

```
1. New → Docker Image
2. Upload Dockerfile.backend
3. Configure → Deploy
```

### 2.3 Add MySQL Database

```
1. New → Database → MySQL
2. Select version 8.0
3. Configure → Create
```

### 2.4 Connect Database to Backend

```
1. Backend service → Variables
2. Add from Database service:
   DB_HOST = database service name
   DB_USER = root
   DB_PASSWORD = (auto-generated)
   DB_NAME = skillswap
   DB_PORT = 3306
3. Save and redeploy
```

### 2.5 Get Backend URL

```
1. Backend service → Deployments → Active
2. Copy public URL: https://xxxx.railway.app
3. Go to GitHub Secrets
4. Update VITE_API_URL = https://xxxx.railway.app
```

✅ **Backend deployed and database running!**

---

## Alternative: Use Render Instead of Railway

If Railway doesn't work for you:

### Render Setup

```
1. Go to https://render.com
2. Sign up with GitHub
3. New Web Service → Connect GitHub repo
4. Select skillswap-backend folder
5. Set Build Command: npm install
6. Set Start Command: npm start
7. Add environment variables (same as above)
8. Deploy
```

**Database on Render**:
```
1. New PostgreSQL (free tier included)
   OR
2. Use external MySQL (Railway provides free tier)
```

---

## 🧪 Step 3: Verify Everything Works

### 3.1 Test API Connection

```bash
curl https://your-backend.railway.app/api/health
# Should return: { "status": "ok", "socketIO": true, ... }
```

### 3.2 Test Frontend

```
Open: https://your-username.github.io/skillswap
# Should load without errors
```

### 3.3 Test Login

```
1. Register new account
2. Should connect to backend API
3. Should store JWT token
4. Should redirect to dashboard
```

---

## 📋 Complete Deployment Checklist

### Frontend (GitHub Pages)
- [ ] Repository created on GitHub
- [ ] All code pushed to `main` branch
- [ ] `vite.config.ts` has `base: '/skillswap/'`
- [ ] `.env.production` created
- [ ] API endpoints use `VITE_API_URL`
- [ ] `deploy-github-pages.yml` workflow created
- [ ] `VITE_API_URL` secret added to GitHub
- [ ] GitHub Pages enabled (Source: GitHub Actions)
- [ ] Site accessible at `https://username.github.io/skillswap`

### Backend (Railway)
- [ ] Railway account created
- [ ] Backend service deployed from GitHub or Docker
- [ ] MySQL database added
- [ ] Environment variables configured
- [ ] Backend URL obtained
- [ ] Health check working (`/api/health`)
- [ ] CORS configured for GitHub Pages domain
- [ ] Logs viewable in Railway dashboard

### Integration
- [ ] `VITE_API_URL` secret updated in GitHub
- [ ] Frontend deployed and built with correct API URL
- [ ] Frontend can connect to backend
- [ ] Login flow works end-to-end
- [ ] Real-time features (chat, presence) work
- [ ] Database queries return data

---

## 🐛 Troubleshooting

### Frontend Shows 404 on Refresh

**Problem**: React Router pages don't work on GitHub Pages
**Solution**: Already fixed with `base: '/skillswap/'` in vite.config.ts

### API Calls Fail

**Problem**: Frontend can't reach backend
**Steps**:
```bash
# 1. Check if backend is running
curl https://your-backend.railway.app/api/health

# 2. Check GitHub Secret
Settings → Secrets → Verify VITE_API_URL

# 3. Rebuild frontend
git commit --allow-empty -m "Trigger rebuild"
git push

# 4. Check CORS on backend
API should allow origin: https://username.github.io
```

### Database Connection Error

**Problem**: Backend can't connect to MySQL
**Steps**:
1. Railway dashboard → Database service
2. Check status (should be "Running")
3. Check credentials in backend environment variables
4. Verify network connectivity

### Deployment Takes Too Long

**Expected**: First deployment 10-15 minutes
**Why**: Building Docker image, installing dependencies
**Next deploys**: 2-5 minutes

---

## 📊 Cost Breakdown

| Service | Cost | What You Get |
|---------|------|-------------|
| GitHub Pages | FREE | Hosting, SSL, CDN, bandwidth |
| Railway Free | FREE | $5/month credits |
| - Backend Service | FREE | Runs on free credits |
| - MySQL Database | FREE | Included in free credits |
| **Total** | **FREE** | Production app, zero cost |

**Note**: After 3 months, Railway may ask for payment method but continues free tier. Can be extended indefinitely if not overused.

---

## 🔄 Update Workflow

Every time you make changes:

```powershell
# Make changes locally
# Test locally with: npm run dev (backend) + npm run dev (frontend)

# Push to GitHub
git add .
git commit -m "Update: feature description"
git push

# Automatic actions:
# 1. GitHub Actions builds frontend
# 2. Deploys to GitHub Pages (2-5 min)
# 3. Railway auto-redeployss backend on code push
# 4. Site updates automatically
```

---

## 🎓 Environment Variables Reference

### Development (Local)

**Terminal 1:**
```bash
cd skillswap-backend
npm run dev
# Runs on http://localhost:8080
```

**Terminal 2:**
```bash
cd skillswap
npm run dev
# Runs on http://localhost:5173
# API calls go to http://localhost:8080
```

### Production (GitHub Pages + Railway)

**Frontend `.env.production`:**
```env
VITE_API_URL=https://your-app.railway.app
```

**Backend Environment Variables (Railway):**
```
NODE_ENV=production
PORT=8080
DB_HOST=database-service-name
DB_PORT=3306
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=skillswap
JWT_SECRET=your-strong-secret
CORS_ORIGIN=https://your-username.github.io
```

---

## 🚨 Security Notes

✅ **Never commit `.env` files with real secrets**
✅ **Use GitHub Secrets for sensitive values**
✅ **Backend CORS should only allow GitHub Pages domain**
✅ **Database passwords should be strong**
✅ **JWT secrets should be random & long**
✅ **Enable HTTPS everywhere** (automatic on both platforms)

---

## 📞 Support Resources

**GitHub Pages Issues:**
- https://docs.github.com/en/pages

**Railway Issues:**
- https://railway.app/pricing
- https://railway.app/docs
- Discord: https://discord.gg/railway

**Render Issues:**
- https://render.com/docs
- https://community.render.com

---

## ✅ Final Verification

After deployment, verify all features:

- [ ] Landing page loads
- [ ] Can register account
- [ ] Can login
- [ ] Can create skill
- [ ] Can search skills
- [ ] Can message other users
- [ ] Can see live presence
- [ ] Gamification (XP, badges) works
- [ ] Dark mode works
- [ ] Mobile responsive

**Your app is now live on the internet completely free!** 🎉

---

**Status**: Production Ready
**Cost**: $0/month
**Deployment**: Automatic
**Last Updated**: 2026-04-24
