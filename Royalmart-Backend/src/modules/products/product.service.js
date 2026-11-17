import prisma from '../../database/prisma.js';
import { ApiError } from '../../errors/ApiError.js';

const SORT_MAP = {
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  rating: { rating: 'desc' },
};

export async function list({ page, limit, search, category, brand, minPrice, maxPrice, sort }) {
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

  const orderBy = SORT_MAP[sort] || { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy, include: { category: true } }),
    prisma.product.count({ where }),
  ]);

  return { products, total, skip, limit };
}

export async function getById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: true,
      reviews: {
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

export function create(data) {
  return prisma.product.create({ data });
}

export function update(id, data) {
  return prisma.product.update({ where: { id }, data });
}

export async function remove(id) {
  await prisma.product.delete({ where: { id } });
}
