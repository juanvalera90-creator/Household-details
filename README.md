# Household Expenses - MVP

A simple, responsive web application for tracking and splitting household expenses between two people. Built with Next.js, Express, TypeScript, Prisma, and SQLite.

## 🎯 Features

- ✅ Record daily household expenses from any device
- ✅ Clear balance display showing who owes whom
- ✅ Monthly household spending summary with category breakdowns
- ✅ Edit and delete expenses
- ✅ CSV export functionality
- ✅ Demo Mode for safe testing
- ✅ Mobile-first responsive design
- ✅ Progressive Web App (PWA) support
- ✅ 100% free and open source

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS (Mobile-first, responsive)

### Hosting (Free Tiers)
- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway / Fly.io

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🚀 Quick Start (Easiest Way)

### Windows Users

**Option 1: Double-click to start**
1. Double-click `START_APP.bat` in the `household-expenses` folder
2. Two windows will open (backend and frontend servers)
3. Your browser will automatically open to `http://localhost:3000`
4. Keep both server windows open while using the app

**Option 2: PowerShell script**
1. Right-click `START_APP.ps1` and select "Run with PowerShell"
2. Or open PowerShell and run: `.\START_APP.ps1`

**To stop the app:**
- Double-click `STOP_APP.bat` or run `.\STOP_APP.ps1`

### First Time Setup

Before using the startup scripts, you need to run the initial setup once:

```bash
# Backend setup (one time only)
cd backend
npm install
echo DATABASE_URL="file:./dev.db" > .env
echo PORT=3001 >> .env
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Frontend setup (one time only)
cd ../frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:3001/api > .env.local
```

After the first setup, you can use `START_APP.bat` anytime!

## 🚀 Manual Setup (Alternative)

### 1. Navigate to Project

```bash
cd household-expenses
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'PORT=3001' >> .env

# Generate Prisma Client
npm run prisma:generate

# Create database schema (use push for quick setup, or migrate for production)
npm run prisma:push
# OR for production: npm run prisma:migrate

# Seed demo data
npm run prisma:seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable (create .env.local)
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001/api' > .env.local

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📱 Usage

### Creating a Group

1. Visit `http://localhost:3000`
2. Enter:
   - Group name (e.g., "Our Home")
   - Person 1 name (e.g., "Ana")
   - Person 2 name (e.g., "Juan")
3. Click "Create Group"

### Demo Mode

1. Visit `http://localhost:3000/demo`
2. Explore the app with pre-populated demo data
3. Demo data is clearly labeled and separate from real data

### Adding Expenses

1. Select Main Category (e.g., "Food & Dining")
2. Select Subcategory (e.g., "Groceries")
3. Enter amount
4. Select who paid
5. Choose date (defaults to today)
6. Optionally add a note
7. Click "Add Expense"

### Viewing Balances

The balance card shows:
- Current balance for each person
- Clear text indicating who owes whom

### Monthly Summary

1. Switch to "Summary" tab
2. Select a month
3. View:
   - Total household spending
   - Amount paid by each person
   - Final monthly balance
   - Totals by main category
   - Totals by subcategory
4. Export to CSV

### Editing/Deleting Expenses

- Click "Edit" on any expense
- Make changes and save
- Click "Delete" to remove an expense

## 🗂️ Project Structure

```
household-expenses/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── prisma/          # Seed script
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   └── components/      # React components
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get group by ID

### Categories
- `GET /api/categories/main/:groupId` - Get main categories
- `GET /api/categories/sub/:groupId` - Get subcategories

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:groupId` - Get expenses (optional `?month=YYYY-MM`)
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Balances
- `GET /api/balances/:groupId` - Get current balances

### Summary
- `GET /api/summary/:groupId?month=YYYY-MM` - Get monthly summary

### Export
- `GET /api/export/:groupId?month=YYYY-MM` - Export expenses as CSV

## 🚢 Deployment

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Start

1. **Push to GitHub**: Upload your code to a GitHub repository
2. **Deploy Backend**: Use Render (free PostgreSQL included)
3. **Deploy Frontend**: Use Vercel (optimized for Next.js)
4. **Share URL**: Give others your Vercel URL

### Quick Steps

**Backend (Render):**
- Create account at [render.com](https://render.com)
- Create PostgreSQL database (free tier)
- Create Web Service, connect GitHub repo
- Set root directory: `backend`
- Build: `npm install && npm run build && npm run prisma:generate`
- Start: `npm run prisma:migrate:deploy && npm start`
- Add `DATABASE_URL` environment variable

**Frontend (Vercel):**
- Create account at [vercel.com](https://vercel.com)
- Import GitHub repository
- Set root directory: `frontend`
- Add `NEXT_PUBLIC_API_URL` environment variable (your Render backend URL)
- Deploy!

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide.**

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create a new group
- [ ] Add expenses with different categories
- [ ] Edit an expense
- [ ] Delete an expense
- [ ] Verify balance calculations
- [ ] View monthly summary
- [ ] Export CSV
- [ ] Test on mobile device
- [ ] Test demo mode

## 📝 Notes

- **Demo Mode**: Accessible via `/demo` route. Demo data is clearly labeled and separate from real data.
- **Expense Split**: All expenses are split 50/50 between the two people.
- **Categories**: Predefined and read-only in MVP. Cannot be edited.
- **Database**: SQLite for local development. Can be switched to PostgreSQL for production.

## 🎨 PWA Icons

For full PWA functionality, you'll need to add icon images:
- `frontend/public/icon-192.png` (192x192 pixels)
- `frontend/public/icon-512.png` (512x512 pixels)

You can create these using any image editor or online tool. The app will work without them, but PWA installation may not show custom icons.

## 🐛 Troubleshooting

### Backend won't start
- Ensure port 3001 is not in use
- Check that Prisma migrations have run
- Verify `.env` file exists with `DATABASE_URL`

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled in backend

### Database errors
- Run `npm run prisma:migrate` to create database
- Run `npm run prisma:seed` to seed demo data
- Check `prisma/schema.prisma` for schema issues

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

Built with free and open-source technologies. No paid services required.

