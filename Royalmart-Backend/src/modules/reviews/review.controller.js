import prisma from '../../config/db.js';

export async function getByProduct(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { productId, rating, comment } = req.body;
    const review = await prisma.review.create({
      data: { productId, userId: req.user.id, rating: Number(rating), comment },
    });

    // Update product average rating
    const agg = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true } });
    await prisma.product.update({ where: { id: productId }, data: { rating: agg._avg.rating || 0 } });

    res.status(201).json({ success: true, data: review });
  } catch (e) { next(e); }
}
