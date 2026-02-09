import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/balances/:groupId - Get balances for a group
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

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

    // Get all expenses for the group
    const expenses = await prisma.expense.findMany({
      where: { groupId },
    });

    // Calculate balances (50/50 split)
    let person1Balance = 0;
    let person2Balance = 0;

    expenses.forEach((expense) => {
      const halfAmount = expense.amount / 2;

      if (expense.paidBy === person1.id) {
        // Person1 paid, so person2 owes half
        person1Balance += halfAmount; // Person1 is owed
        person2Balance -= halfAmount; // Person2 owes
      } else {
        // Person2 paid, so person1 owes half
        person1Balance -= halfAmount; // Person1 owes
        person2Balance += halfAmount; // Person2 is owed
      }
    });

    res.json({
      person1: {
        id: person1.id,
        name: person1.name,
        balance: person1Balance,
      },
      person2: {
        id: person2.id,
        name: person2.name,
        balance: person2Balance,
      },
    });
  } catch (error) {
    console.error('Error calculating balances:', error);
    res.status(500).json({ error: 'Failed to calculate balances' });
  }
});

export default router;


