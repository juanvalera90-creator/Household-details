import { Router } from 'express';
import { prisma } from '../db';
import { createExpenseSchema, updateExpenseSchema } from '../validators/schemas';

const router = Router();

// POST /api/expenses - Create a new expense
router.post('/', async (req, res) => {
  try {
    const parsed = createExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message = Object.values(first).flat().join(' ') || 'Invalid request';
      return res.status(400).json({ error: message });
    }
    const { amount, subCategoryId, paidBy, groupId, date, note } = parsed.data;

    const expense = await prisma.expense.create({
      data: {
        amount,
        subCategoryId,
        paidBy,
        groupId,
        date,
        note: note ?? null,
      },
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
        person: true,
      },
    });

    res.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// GET /api/expenses/:groupId - Get all expenses for a group
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const monthParam = req.query.month;
    const raw = Array.isArray(monthParam) ? monthParam[0] : monthParam;
    const monthStr = typeof raw === 'string' ? raw.trim() : '';

    const whereClause: { groupId: string; date?: { gte: string; lte: string } } = { groupId };

    if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
      const parts = monthStr.split('-');
      const y = parts[0];
      const m = parts[1];
      if (y && m) {
        const lastDay = new Date(parseInt(y, 10), parseInt(m, 10), 0).getDate();
        whereClause.date = {
          gte: `${monthStr}-01`,
          lte: `${monthStr}-${String(lastDay).padStart(2, '0')}`,
        };
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
        person: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// PUT /api/expenses/:id - Update an expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = updateExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message = Object.values(first).flat().join(' ') || 'Invalid request';
      return res.status(400).json({ error: message });
    }
    const data = parsed.data;
    const updateData: { amount?: number; subCategoryId?: string; paidBy?: string; date?: string; note?: string | null } = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.subCategoryId !== undefined) updateData.subCategoryId = data.subCategoryId;
    if (data.paidBy !== undefined) updateData.paidBy = data.paidBy;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.note !== undefined) updateData.note = data.note;

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
        person: true,
      },
    });

    res.json(expense);
  } catch (error: unknown) {
    console.error('Error updating expense:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting expense:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;


