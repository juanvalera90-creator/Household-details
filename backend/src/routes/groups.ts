import { Router } from 'express';
import { prisma } from '../db';
import { seedCategoriesForGroup } from '../utils/seedCategories';
import { createGroupSchema } from '../validators/schemas';

const router = Router();

// GET /api/groups - Get all groups (excluding demo) - MUST come before /:id route
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        isDemo: false,
      },
      include: {
        persons: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST /api/groups - Create a new group
router.post('/', async (req, res) => {
  try {
    const parsed = createGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message = Object.values(first).flat().join(' ') || 'Invalid request';
      return res.status(400).json({ error: message });
    }
    const { id, name, isDemo, person1Name, person2Name } = parsed.data;

    const group = await prisma.group.create({
      data: {
        ...(id && { id }),
        name,
        isDemo,
        persons: {
          create: [
            { name: person1Name },
            { name: person2Name },
          ],
        },
      },
      include: {
        persons: true,
      },
    });

    // Seed categories for the new group
    await seedCategoriesForGroup(group.id);

    res.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// GET /api/groups/:id - Get a group by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        persons: true,
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// DELETE /api/groups/:id - Delete a group
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Prevent deleting demo group
    if (group.isDemo) {
      return res.status(400).json({ error: 'Cannot delete demo group' });
    }

    // Delete group (cascade will delete related records)
    await prisma.group.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

export default router;

