# 🚀 Deployment Guide - Share Your App Online

This guide will help you deploy your Household Expenses app so others can access it online using **100% free** hosting services.

## 📋 Overview

You'll need to deploy:
1. **Backend** (Node.js API) - Render, Railway, or Fly.io
2. **Frontend** (Next.js) - Vercel or Netlify
3. **Database** - PostgreSQL (free tier from Render) or SQLite (for simple deployments)

**Current stack (for reference):** Backend uses **Zod** for request validation (create/update group and expenses). No extra env vars or build steps are required for this.

## 🎯 Recommended Setup

- **Frontend**: Vercel (easiest for Next.js)
- **Backend**: Render (free PostgreSQL included)
- **Database**: PostgreSQL (provided by Render)

---

## 📦 Step 1: Prepare Your Code

### 1.1 Push to GitHub

1. **Create a GitHub account** if you don't have one: https://github.com  
2. **Create a new repository** on GitHub:
   - Click **"New repository"**
   - Name it (e.g. `household-expenses`)
   - Leave it empty (no README, .gitignore, or license)
   - Click **"Create repository"**
3. **Push your code** from your computer:

   Open a terminal in your **project folder** (the one that contains the `frontend` and `backend` folders). Then run:

```bash
# If this folder is not yet a Git repo:
git init
git branch -M main

# Stage and commit all files
git add .
git commit -m "Initial commit"

# Connect to your GitHub repo (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/household-expenses.git

# Push to GitHub
git push -u origin main
```

**If you already have a Git repo** (e.g. you cloned or already ran `git init`), just add the remote and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/household-expenses.git
git branch -M main
git push -u origin main
```

**Tip:** If GitHub asks for login, use a [Personal Access Token](https://github.com/settings/tokens) instead of your password when using HTTPS.

---

## 🗄️ Step 2: Deploy Backend (Render)

### 2.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (free)
3. No credit card required

### 2.2 Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Name it: `household-expenses-db`
3. Select **"Free"** plan
4. Choose a region close to you
5. Click **"Create Database"**
6. **Important**: Copy the **Internal Database URL** (you'll need it later)

### 2.3 Update Prisma Schema for PostgreSQL

Edit `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2.4 Deploy Backend Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `household-expenses-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `npm run prisma:migrate deploy && npm start`
4. Add Environment Variables:
   - `DATABASE_URL`: Paste the PostgreSQL URL from step 2.2
   - `PORT`: `3001` (or leave default)
   - `NODE_ENV`: `production`
5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)

### 2.5 Run Database Migrations

After first deployment, you may need to run migrations manually:

1. In Render dashboard, go to your backend service
2. Click **"Shell"** tab
3. Run:
```bash
cd backend
npm run prisma:migrate deploy
npm run prisma:seed
```

### 2.6 Get Your Backend URL

Once deployed, Render will give you a URL like:
`https://household-expenses-backend.onrender.com`

**Copy this URL** - you'll need it for the frontend!

---

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub (free)
3. No credit card required

### 3.2 Deploy Frontend

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. Add Environment Variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api`
     (Use the URL from Step 2.6)
5. Click **"Deploy"**
6. Wait for deployment (2-5 minutes)

### 3.3 Get Your Frontend URL

Vercel will give you a URL like:
`https://household-expenses.vercel.app`

**This is your public app URL!** Share this with others.

---

## 🔄 Step 4: Update CORS (If Needed)

If you get CORS errors, update `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: [
    'https://your-frontend-url.vercel.app',
    'http://localhost:3000' // For local testing
  ],
  credentials: true
}));
```

Then redeploy the backend.

---

## 🧪 Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Create a test group
3. Add some expenses
4. Check if everything works

---

## 📝 Alternative: Netlify (Frontend)

If you prefer Netlify over Vercel:

1. Go to https://netlify.com
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your GitHub repo
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`
6. Add environment variable: `NEXT_PUBLIC_API_URL`
7. Deploy!

---

## 🚂 Alternative: Railway (Backend)

If you prefer Railway over Render:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add PostgreSQL service
6. Configure environment variables
7. Deploy!

---

## 🔐 Security Notes

- ✅ Your database URL is private (stored in environment variables)
- ✅ Frontend can only access backend via API
- ✅ No authentication in MVP (as per requirements)
- ⚠️ Anyone with the URL can access your app
- ⚠️ Demo data is shared across all users

---

## 🐛 Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify DATABASE_URL is correct
- Check Render logs for errors

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings
- Ensure backend is running (check Render dashboard)

### Database errors
- Run migrations: `npm run prisma:migrate deploy`
- Check database connection string
- Verify PostgreSQL is running in Render

### Build fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

---

## 📊 Cost Summary

**Total Cost: $0.00** ✅

- Vercel: Free tier (unlimited for personal projects)
- Render: Free tier (750 hours/month)
- PostgreSQL: Free tier (90 days, then $7/month) OR use SQLite
- Netlify: Free tier (100GB bandwidth/month)

---

## 🔗 Quick Links

- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com
- **Render**: https://render.com
- **Railway**: https://railway.app

---

## 📱 Sharing Your App

Once deployed, share your Vercel URL:
```
https://your-app-name.vercel.app
```

Anyone with this URL can:
- Create their own groups
- Track expenses
- View summaries
- Export data

**Note**: Since there's no authentication, all data is public to anyone with the URL. For production use, consider adding authentication later.

---

## 🎉 You're Done!

Your app is now live and shareable! 🚀

