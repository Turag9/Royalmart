import { z } from 'zod';
import prisma from '../../config/db.js';

export const ReviewCreateSchema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
});

export async function getByProduct(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const { productId, rating, comment } = req.body;

    // Single transaction so the new review and the recalculated product
    // average rating land together — concurrent reviews can't leave the
    // product with a stale average.
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { productId, userId: req.user.id, rating, comment: comment ?? null },
      });
      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      });
      await tx.product.update({
        where: { id: productId },
        data: { rating: agg._avg.rating || 0 },
      });
      return created;
    });

    res.status(201).json({ success: true, data: review });
  } catch (e) {
    next(e);
  }
}
