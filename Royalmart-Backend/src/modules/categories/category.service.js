import prisma from '../../database/prisma.js';
import { slugify } from '../../utils/slugify.js';

export function list() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
}

export function create({ name, parentId }) {
  return prisma.category.create({
    data: { name, slug: slugify(name), parentId: parentId || null },
  });
}

export function update(id, input) {
  const data = { ...input };
  if (data.name) data.slug = slugify(data.name);
  return prisma.category.update({ where: { id }, data });
}

export async function remove(id) {
  await prisma.category.delete({ where: { id } });
}
