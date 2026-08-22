import { z } from 'zod';
import prisma from '../../config/db.js';

export const ProductCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().positive(),
  discountPercentage: z.number().min(0).max(100).default(0),
  rating: z.number().min(0).max(5).optional(),
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().uuid().optional().nullable(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.string().max(500).optional(),
  brand: z.string().max(500).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
});

export async function getAll(req, res, next) {
  try {
    const { page, limit, search, category, brand, minPrice, maxPrice, sort } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (category) where.category = { slug: { in: category.split(',') } };
    if (brand) where.brand = { in: brand.split(','), mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy, include: { category: true } }),
      prisma.product.count({ where }),
    ]);

    res.json({ success: true, data: products, total, skip, limit });
  } catch (e) {
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (e) {
    next(e);
  }
}
