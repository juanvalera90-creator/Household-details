import express from 'express';
import cors from 'cors';
import { prisma } from './db';
import groupsRouter from './routes/groups';
import expensesRouter from './routes/expenses';
import categoriesRouter from './routes/categories';
import balancesRouter from './routes/balances';
import summaryRouter from './routes/summary';
import exportRouter from './routes/export';

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/groups', groupsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/balances', balancesRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/export', exportRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});


