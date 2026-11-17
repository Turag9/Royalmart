import prisma from '../../database/prisma.js';

export function listByProduct(productId) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Single transaction so the new review and the recalculated product average
 * land together — concurrent reviews can't leave a stale average.
 */
export function create(userId, { productId, rating, comment }) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: { productId, userId, rating, comment: comment ?? null },
    });
    const agg = await tx.review.aggregate({ where: { productId }, _avg: { rating: true } });
    await tx.product.update({
      where: { id: productId },
      data: { rating: agg._avg.rating || 0 },
    });
    return created;
  });
}
