import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper to get family member IDs
async function getFamilyMemberIds(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      family: {
        include: {
          members: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (user?.family) {
    return user.family.members.map((m) => m.id);
  }
  return [userId];
}

// Get all user's checklists (including family members')
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const memberIds = await getFamilyMemberIds(req.userId!);

    const checklists = await prisma.checklist.findMany({
      where: { userId: { in: memberIds } },
      include: {
        template: {
          select: {
            name: true,
            nameEn: true,
            icon: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        itemStates: true,
        _count: {
          select: { itemStates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate progress for each checklist
    const checklistsWithProgress = checklists.map((checklist) => {
      const total = checklist.itemStates.length;
      const checked = checklist.itemStates.filter((state) => state.checked).length;
      return {
        ...checklist,
        progress: {
          total,
          checked,
          percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
        },
      };
    });

    res.json(checklistsWithProgress);
  } catch (error) {
    console.error('Get checklists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single checklist with items (family members can access)
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const memberIds = await getFamilyMemberIds(req.userId!);

    const checklist = await prisma.checklist.findFirst({
      where: {
        id: req.params.id,
        userId: { in: memberIds },
      },
      include: {
        template: {
          include: {
            items: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        itemStates: true,
      },
    });

    if (!checklist) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    // Merge items with their states
    const itemsWithState = checklist.template.items.map((item) => {
      const state = checklist.itemStates.find((s) => s.itemId === item.id);
      return {
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        category: item.category,
        categoryEn: item.categoryEn,
        orderIndex: item.orderIndex,
        checked: state?.checked || false,
        checkedAt: state?.checkedAt || null,
        stateId: state?.id || null,
      };
    });

    const total = itemsWithState.length;
    const checked = itemsWithState.filter((item) => item.checked).length;

    res.json({
      id: checklist.id,
      name: checklist.name,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
      completedAt: checklist.completedAt,
      createdBy: checklist.user,
      template: {
        id: checklist.template.id,
        name: checklist.template.name,
        nameEn: checklist.template.nameEn,
        icon: checklist.template.icon,
      },
      items: itemsWithState,
      progress: {
        total,
        checked,
        percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get checklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create checklist from template
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { templateId, name } = req.body;

    if (!templateId) {
      res.status(400).json({ error: 'Template ID is required' });
      return;
    }

    // Verify template exists and user has access
    const template = await prisma.checklistTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { isDefault: true },
          { userId: req.userId },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Create checklist with item states for all template items
    const checklist = await prisma.checklist.create({
      data: {
        name: name || `${template.name} - ${new Date().toLocaleDateString()}`,
        templateId,
        userId: req.userId!,
        itemStates: {
          create: template.items.map((item) => ({
            itemId: item.id,
            checked: false,
          })),
        },
      },
      include: {
        template: {
          select: {
            name: true,
            nameEn: true,
            icon: true,
          },
        },
        itemStates: true,
      },
    });

    res.status(201).json(checklist);
  } catch (error) {
    console.error('Create checklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle item checked state (family members can modify)
router.patch(
  '/:id/items/:itemId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id, itemId } = req.params;
      const { checked } = req.body;

      const memberIds = await getFamilyMemberIds(req.userId!);

      // Verify checklist belongs to user or family member
      const checklist = await prisma.checklist.findFirst({
        where: {
          id,
          userId: { in: memberIds },
        },
      });

      if (!checklist) {
        res.status(404).json({ error: 'Checklist not found' });
        return;
      }

      // Update or create item state
      const itemState = await prisma.checklistItemState.upsert({
        where: {
          checklistId_itemId: {
            checklistId: id,
            itemId,
          },
        },
        update: {
          checked,
          checkedAt: checked ? new Date() : null,
        },
        create: {
          checklistId: id,
          itemId,
          checked,
          checkedAt: checked ? new Date() : null,
        },
      });

      // Check if all items are now checked
      const allStates = await prisma.checklistItemState.findMany({
        where: { checklistId: id },
      });

      const allChecked = allStates.every((state) => state.checked);

      // Update checklist completedAt if all items are checked
      await prisma.checklist.update({
        where: { id },
        data: {
          completedAt: allChecked ? new Date() : null,
        },
      });

      res.json(itemState);
    } catch (error) {
      console.error('Toggle item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete checklist (family members can delete)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const memberIds = await getFamilyMemberIds(req.userId!);

    const checklist = await prisma.checklist.findFirst({
      where: {
        id: req.params.id,
        userId: { in: memberIds },
      },
    });

    if (!checklist) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    await prisma.checklist.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete checklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
