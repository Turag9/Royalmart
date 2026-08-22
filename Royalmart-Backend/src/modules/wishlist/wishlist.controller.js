import { z } from 'zod';
import prisma from '../../config/db.js';

export const WishlistAddSchema = z.object({
  productId: z.string().min(1).max(120),
});

export async function getAll(req, res, next) {
  try {
    const items = await prisma.wishlist.findMany({
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
    const { productId } = req.body;
    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      create: { userId: req.user.id, productId },
      update: {},
    });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
}

export async function toggle(req, res, next) {
  try {
    const { productId } = req.body;
    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from wishlist', added: false });
    }
    await prisma.wishlist.create({ data: { userId: req.user.id, productId } });
    res.json({ success: true, message: 'Added to wishlist', added: true });
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, OR: [{ id }, { productId: id }] },
    });
    if (!result.count) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (e) {
    next(e);
  }
}
