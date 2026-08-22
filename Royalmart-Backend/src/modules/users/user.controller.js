import { z } from 'zod';
import prisma from '../../config/db.js';

export const ListQuerySchema = z.object({
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export const RoleUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export const BlockUpdateSchema = z.object({
  isBlocked: z.boolean(),
});

export async function getAll(req, res, next) {
  try {
    const { search, limit } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
}

export async function updateRole(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
    });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

export async function toggleBlock(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBlocked: req.body.isBlocked },
    });
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (e) {
    next(e);
  }
}
