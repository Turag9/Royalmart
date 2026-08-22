import { z } from 'zod';
import prisma from '../../config/db.js';

export const CategoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  parentId: z.string().uuid().optional().nullable(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getAll(_req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const { name, parentId } = req.body;
    const category = await prisma.category.create({
      data: { name, slug: slugify(name), parentId: parentId || null },
    });
    res.status(201).json({ success: true, data: category });
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (data.name) data.slug = slugify(data.name);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: category });
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) {
    next(e);
  }
}
