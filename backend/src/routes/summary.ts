import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/summary/:groupId - Get monthly or all-time summary
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const monthParam = req.query.month;
    // Normalize: query can be string or array (e.g. ?month=all)
    const raw = Array.isArray(monthParam) ? monthParam[0] : monthParam;
    const monthStr = (typeof raw === 'string' ? raw : String(raw ?? '')).trim();
    const isAllMonths = monthStr.toLowerCase() === 'all';

    if (!monthParam || monthStr === '') {
      return res.status(400).json({ error: 'Month parameter is required (YYYY-MM or "all")' });
    }

    // Get group with persons
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        persons: true,
      },
    });

    if (!group || group.persons.length !== 2) {
      return res.status(400).json({ error: 'Group must have exactly 2 persons' });
    }

    const [person1, person2] = group.persons;

    // Get expenses (for month or all)
    const whereClause = isAllMonths
      ? { groupId }
      : (() => {
          const parts = monthStr.split('-');
          const y = parts[0];
          const m = parts[1];
          if (!y || !m || y.length !== 4 || m.length !== 2) {
            throw new Error('Invalid month format (use YYYY-MM or "all")');
          }
          const lastDay = new Date(parseInt(y, 10), parseInt(m, 10), 0).getDate();
          return {
            groupId,
            date: {
              gte: `${monthStr}-01`,
              lte: `${monthStr}-${String(lastDay).padStart(2, '0')}`,
            },
          };
        })();

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
        person: true,
      },
    });

    // Calculate totals
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    let person1Total = 0;
    let person2Total = 0;

    expenses.forEach((expense) => {
      if (expense.paidBy === person1.id) {
        person1Total += expense.amount;
      } else {
        person2Total += expense.amount;
      }
    });

    // Calculate final balance
    const person1Balance = person1Total - totalSpending / 2;
    const person2Balance = person2Total - totalSpending / 2;

    // Calculate totals by main category
    const mainCategoryTotals: Record<string, { name: string; total: number }> = {};
    expenses.forEach((expense) => {
      const mainCatName = expense.subCategory.mainCategory.name;
      if (!mainCategoryTotals[mainCatName]) {
        mainCategoryTotals[mainCatName] = { name: mainCatName, total: 0 };
      }
      mainCategoryTotals[mainCatName].total += expense.amount;
    });

    // Calculate totals by subcategory
    const subCategoryTotals: Record<string, { name: string; mainCategory: string; total: number }> = {};
    expenses.forEach((expense) => {
      const subCatName = expense.subCategory.name;
      const mainCatName = expense.subCategory.mainCategory.name;
      if (!subCategoryTotals[subCatName]) {
        subCategoryTotals[subCatName] = {
          name: subCatName,
          mainCategory: mainCatName,
          total: 0,
        };
      }
      subCategoryTotals[subCatName].total += expense.amount;
    });

    res.json({
      month: isAllMonths ? 'all' : monthStr,
      totalSpending,
      person1: {
        id: person1.id,
        name: person1.name,
        totalPaid: person1Total,
        balance: person1Balance,
      },
      person2: {
        id: person2.id,
        name: person2.name,
        totalPaid: person2Total,
        balance: person2Balance,
      },
      mainCategoryTotals: Object.values(mainCategoryTotals).sort((a, b) => b.total - a.total),
      subCategoryTotals: Object.values(subCategoryTotals).sort((a, b) => b.total - a.total),
      expenses,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;


