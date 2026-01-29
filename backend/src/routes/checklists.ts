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
        itemStates: {
          where: { deleted: false },
        },
        customItems: true,
        _count: {
          select: { itemStates: true, customItems: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate progress for each checklist
    const checklistsWithProgress = checklists.map((checklist) => {
      const templateItemsCount = checklist.itemStates.filter(s => !s.deleted).length;
      const customItemsCount = checklist.customItems.length;
      const total = templateItemsCount + customItemsCount;
      
      const templateChecked = checklist.itemStates.filter((state) => state.checked && !state.deleted).length;
      const customChecked = checklist.customItems.filter((item) => item.checked).length;
      const checked = templateChecked + customChecked;
      
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
        id: req.params.id as string,
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
        customItems: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!checklist) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    // Merge template items with their states (excluding deleted ones)
    const templateItemsWithState = checklist.template.items
      .map((item) => {
        const state = checklist.itemStates.find((s) => s.itemId === item.id);
        if (state?.deleted) return null;
        return {
          id: item.id,
          name: item.name,
          nameEn: item.nameEn,
          category: item.category,
          categoryEn: item.categoryEn,
          orderIndex: item.orderIndex,
          checked: state?.checked || false,
          checkedAt: state?.checkedAt || null,
          isCustom: false,
        };
      })
      .filter(Boolean);

    // Add custom items
    const customItemsWithState = checklist.customItems.map((item) => ({
      id: item.id,
      name: item.name,
      nameEn: item.nameEn,
      category: item.category || '自定义',
      categoryEn: item.categoryEn || 'Custom',
      orderIndex: item.orderIndex + 10000, // Put custom items after template items
      checked: item.checked,
      checkedAt: item.checkedAt,
      isCustom: true,
    }));

    const allItems = [...templateItemsWithState, ...customItemsWithState];
    const total = allItems.length;
    const checked = allItems.filter((item) => item?.checked).length;

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
      items: allItems,
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

// Add custom item to checklist
router.post('/:id/items', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, nameEn, category, categoryEn } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Item name is required' });
      return;
    }

    const memberIds = await getFamilyMemberIds(req.userId!);

    // Verify checklist belongs to user or family
    const checklist = await prisma.checklist.findFirst({
      where: {
        id,
        userId: { in: memberIds },
      },
      include: {
        customItems: true,
      },
    });

    if (!checklist) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    // Get next order index
    const maxOrderIndex = checklist.customItems.length > 0
      ? Math.max(...checklist.customItems.map((i) => i.orderIndex))
      : -1;

    const customItem = await prisma.customChecklistItem.create({
      data: {
        name,
        nameEn: nameEn || name,
        category: category || '自定义',
        categoryEn: categoryEn || 'Custom',
        checklistId: id,
        orderIndex: maxOrderIndex + 1,
      },
    });

    res.status(201).json({
      id: customItem.id,
      name: customItem.name,
      nameEn: customItem.nameEn,
      category: customItem.category,
      categoryEn: customItem.categoryEn,
      checked: customItem.checked,
      checkedAt: customItem.checkedAt,
      isCustom: true,
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle item checked state (family members can modify)
router.patch(
  '/:id/items/:itemId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id, itemId } = req.params as { id: string; itemId: string };
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

      // Check if it's a custom item
      const customItem = await prisma.customChecklistItem.findFirst({
        where: {
          id: itemId,
          checklistId: id,
        },
      });

      if (customItem) {
        // Update custom item
        const updated = await prisma.customChecklistItem.update({
          where: { id: itemId },
          data: {
            checked,
            checkedAt: checked ? new Date() : null,
          },
        });
        res.json(updated);
      } else {
        // Update template item state
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
        res.json(itemState);
      }

      // Check if all items are now checked
      const allTemplateStates = await prisma.checklistItemState.findMany({
        where: { checklistId: id, deleted: false },
      });
      const allCustomItems = await prisma.customChecklistItem.findMany({
        where: { checklistId: id },
      });

      const allChecked = 
        allTemplateStates.every((state) => state.checked) &&
        allCustomItems.every((item) => item.checked);

      // Update checklist completedAt if all items are checked
      await prisma.checklist.update({
        where: { id },
        data: {
          completedAt: allChecked ? new Date() : null,
        },
      });
    } catch (error) {
      console.error('Toggle item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete item from checklist
router.delete(
  '/:id/items/:itemId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id, itemId } = req.params as { id: string; itemId: string };

      const memberIds = await getFamilyMemberIds(req.userId!);

      // Verify checklist belongs to user or family
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

      // Check if it's a custom item
      const customItem = await prisma.customChecklistItem.findFirst({
        where: {
          id: itemId,
          checklistId: id,
        },
      });

      if (customItem) {
        // Delete custom item
        await prisma.customChecklistItem.delete({
          where: { id: itemId },
        });
      } else {
        // Mark template item as deleted (soft delete)
        await prisma.checklistItemState.upsert({
          where: {
            checklistId_itemId: {
              checklistId: id,
              itemId,
            },
          },
          update: {
            deleted: true,
          },
          create: {
            checklistId: id,
            itemId,
            checked: false,
            deleted: true,
          },
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete item error:', error);
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
        id: req.params.id as string,
        userId: { in: memberIds },
      },
    });

    if (!checklist) {
      res.status(404).json({ error: 'Checklist not found' });
      return;
    }

    await prisma.checklist.delete({
      where: { id: req.params.id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete checklist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
