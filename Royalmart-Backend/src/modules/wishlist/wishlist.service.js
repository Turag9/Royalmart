import prisma from '../../database/prisma.js';
import { ApiError } from '../../errors/ApiError.js';

export function list(userId) {
  return prisma.wishlist.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
}

export function add(userId, productId) {
  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
}

/** Returns `true` when the item was added, `false` when it was removed. */
export async function toggle(userId, productId) {
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return false;
  }
  await prisma.wishlist.create({ data: { userId, productId } });
  return true;
}

/** `id` may be the wishlist row id or the productId. */
export async function remove(userId, id) {
  const result = await prisma.wishlist.deleteMany({
    where: { userId, OR: [{ id }, { productId: id }] },
  });
  if (!result.count) throw ApiError.notFound('Wishlist item not found');
}
