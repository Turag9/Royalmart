import prisma from '../../database/prisma.js';

export function list({ search, limit }) {
  const where = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.user.findMany({
    where,
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isBlocked: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/** Admin overview list (no filters). */
export function listAll() {
  return prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export function updateRole(id, role) {
  return prisma.user.update({ where: { id }, data: { role } });
}

export function setBlocked(id, isBlocked) {
  return prisma.user.update({ where: { id }, data: { isBlocked } });
}

export async function remove(id) {
  await prisma.user.delete({ where: { id } });
}
