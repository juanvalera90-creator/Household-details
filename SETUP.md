# Quick Setup Guide

## 🚀 Easiest Way to Start (After Initial Setup)

**Just double-click:** `START_APP.bat`

That's it! The script will:
- ✅ Start the backend server
- ✅ Start the frontend server  
- ✅ Open your browser automatically
- ✅ Show you helpful status messages

**To stop:** Double-click `STOP_APP.bat`

---

## One-Time Setup (First Time Only)

### Backend

```bash
cd backend
npm install
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'PORT=3001' >> .env
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Frontend

```bash
cd frontend
npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001/api' > .env.local
```

## Running the App

### Option 1: Use Startup Script (Recommended)
Just double-click `START_APP.bat` - it handles everything!

### Option 2: Manual Start

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

## Demo Mode

Visit http://localhost:3000/demo to try the app with demo data.

