import { z } from 'zod';
import prisma from '../../config/db.js';

export const CartAddSchema = z.object({
  productId: z.string().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export async function getAll(req, res, next) {
  try {
    const items = await prisma.cart.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: items });
  } catch (e) {
    next(e);
  }
}

export async function add(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const item = await prisma.cart.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      create: { userId: req.user.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const clear = req.query.clear === 'true';

    const row =
      (await prisma.cart.findFirst({ where: { id, userId: req.user.id } })) ||
      (await prisma.cart.findFirst({ where: { productId: id, userId: req.user.id } }));

    if (!row) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (clear || row.quantity <= 1) {
      await prisma.cart.delete({ where: { id: row.id } });
      return res.json({ success: true, message: 'Removed from cart', removed: true });
    }

    const updated = await prisma.cart.update({
      where: { id: row.id },
      data: { quantity: { decrement: 1 } },
    });
    res.json({
      success: true,
      message: 'Cart item decremented',
      data: updated,
      removed: false,
    });
  } catch (e) {
    next(e);
  }
}
