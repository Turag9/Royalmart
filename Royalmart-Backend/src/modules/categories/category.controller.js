import prisma from '../../config/db.js';

export async function getAll(req, res, next) {
  try {
    const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
    res.json({ success: true, data: categories });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { name, parentId } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.category.create({ data: { name, slug, parentId } });
    res.status(201).json({ success: true, data: category });
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const { name, parentId } = req.body;
    const data = { ...req.body };
    if (name) data.slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: category });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { next(e); }
}
