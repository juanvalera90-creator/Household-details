import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/categories/main/:groupId - Get all main categories for a group
router.get('/main/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const mainCategories = await prisma.mainCategory.findMany({
      where: { groupId },
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(mainCategories);
  } catch (error) {
    console.error('Error fetching main categories:', error);
    res.status(500).json({ error: 'Failed to fetch main categories' });
  }
});

// GET /api/categories/sub/:groupId - Get all subcategories for a group
router.get('/sub/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const subCategories = await prisma.subCategory.findMany({
      where: { groupId },
      include: {
        mainCategory: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(subCategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

export default router;


