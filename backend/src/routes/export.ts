import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/export/:groupId - Export expenses as CSV
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const monthParam = req.query.month;
    const raw = Array.isArray(monthParam) ? monthParam[0] : monthParam;
    const monthStr = typeof raw === 'string' ? raw : String(raw ?? '');
    const isAllMonths = monthStr.toLowerCase() === 'all';

    let whereClause: { groupId: string; date?: { gte: string; lte: string } } = { groupId };

    if (!isAllMonths && monthStr) {
      const parts = monthStr.split('-');
      const year = parts[0];
      const monthNum = parts[1];
      if (year && monthNum) {
        const lastDay = new Date(parseInt(year, 10), parseInt(monthNum, 10), 0).getDate();
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
        date: 'asc',
      },
    });

    // Generate CSV
    const headers = ['Date', 'Main Category', 'Subcategory', 'Amount', 'Paid By', 'Note'];
    const rows = expenses.map((exp) => [
      exp.date,
      exp.subCategory.mainCategory.name,
      exp.subCategory.name,
      exp.amount.toFixed(2),
      exp.person.name,
      exp.note || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expenses-${isAllMonths ? 'all' : monthStr}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting expenses:', error);
    res.status(500).json({ error: 'Failed to export expenses' });
  }
});

export default router;


