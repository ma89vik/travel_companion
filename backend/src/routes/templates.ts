import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all templates (default ones + user's custom templates)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.checklistTemplate.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: req.userId },
        ],
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single template
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const template = await prisma.checklistTemplate.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { isDefault: true },
          { userId: req.userId },
        ],
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create custom template
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, items } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Template name is required' });
      return;
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        name,
        description,
        icon,
        userId: req.userId,
        items: {
          create: (items || []).map((item: { name: string; category?: string }, index: number) => ({
            name: item.name,
            category: item.category,
            orderIndex: index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
