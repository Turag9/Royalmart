import prisma from '../../config/db.js';

export async function getAll(req, res, next) {
  try {
    const { page = 1, limit = 20, search, category, brand, minPrice, maxPrice, sort } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (category) where.category = { slug: { in: category.split(',') } };
    if (brand) where.brand = { in: brand.split(','), mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: Number(limit), orderBy, include: { category: true } }),
      prisma.product.count({ where }),
    ]);

    res.json({ success: true, data: products, total, skip, limit: Number(limit) });
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, variants: true, reviews: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, data: product });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (e) { next(e); }
}
