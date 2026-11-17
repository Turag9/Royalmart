import prisma from '../../database/prisma.js';
import { ApiError } from '../../errors/ApiError.js';

export function list(userId) {
  return prisma.cart.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
}

export function add(userId, { productId, quantity }) {
  return prisma.cart.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
}

/**
 * Removes one unit (or the whole row when `clear` is true / quantity <= 1).
 * `id` may be either the cart row id or the productId.
 * Returns `{ removed, item? }`.
 */
export async function remove(userId, id, clear = false) {
  const row =
    (await prisma.cart.findFirst({ where: { id, userId } })) ||
    (await prisma.cart.findFirst({ where: { productId: id, userId } }));

  if (!row) {
    // Already removed (e.g. duplicate request) - treat as success when clearing.
    if (clear) return { removed: true };
    throw ApiError.notFound('Cart item not found');
  }

  if (clear || row.quantity <= 1) {
    await prisma.cart.deleteMany({ where: { id: row.id, userId } });
    return { removed: true };
  }

  const item = await prisma.cart.update({
    where: { id: row.id },
    data: { quantity: { decrement: 1 } },
  });
  return { removed: false, item };
}
