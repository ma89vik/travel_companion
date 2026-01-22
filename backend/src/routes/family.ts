import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Generate a random 6-character code
function generateFamilyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get current user's family info
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        family: {
          include: {
            members: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user?.family) {
      res.json({ family: null });
      return;
    }

    res.json({
      family: {
        id: user.family.id,
        name: user.family.name,
        code: user.family.code,
        members: user.family.members,
      },
    });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new family
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    // Check if user already in a family
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user?.familyId) {
      res.status(400).json({ error: 'You are already in a family. Leave first to create a new one.' });
      return;
    }

    // Generate unique code
    let code = generateFamilyCode();
    let exists = await prisma.family.findUnique({ where: { code } });
    while (exists) {
      code = generateFamilyCode();
      exists = await prisma.family.findUnique({ where: { code } });
    }

    // Create family and add user
    const family = await prisma.family.create({
      data: {
        name: name || 'My Family',
        code,
        members: {
          connect: { id: req.userId },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      family: {
        id: family.id,
        name: family.name,
        code: family.code,
        members: family.members,
      },
    });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join a family by code
router.post('/join', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Family code is required' });
      return;
    }

    // Check if user already in a family
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user?.familyId) {
      res.status(400).json({ error: 'You are already in a family. Leave first to join another.' });
      return;
    }

    // Find family by code
    const family = await prisma.family.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!family) {
      res.status(404).json({ error: 'Family not found. Check the code and try again.' });
      return;
    }

    // Add user to family
    await prisma.user.update({
      where: { id: req.userId },
      data: { familyId: family.id },
    });

    const updatedFamily = await prisma.family.findUnique({
      where: { id: family.id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      family: {
        id: updatedFamily!.id,
        name: updatedFamily!.name,
        code: updatedFamily!.code,
        members: updatedFamily!.members,
      },
    });
  } catch (error) {
    console.error('Join family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave family
router.post('/leave', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { family: { include: { members: true } } },
    });

    if (!user?.familyId) {
      res.status(400).json({ error: 'You are not in a family' });
      return;
    }

    // Remove user from family
    await prisma.user.update({
      where: { id: req.userId },
      data: { familyId: null },
    });

    // If family is now empty, delete it
    if (user.family && user.family.members.length <= 1) {
      await prisma.family.delete({
        where: { id: user.familyId },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Leave family error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
