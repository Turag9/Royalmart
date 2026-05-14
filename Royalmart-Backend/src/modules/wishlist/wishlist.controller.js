import prisma from '../../config/db.js';

export async function getAll(req, res, next) {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
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
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await prisma.wishlist.deleteMany({ where: { userId: req.user.id, productId: req.params.productId } });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (e) { next(e); }
}
