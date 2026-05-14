import prisma from '../../config/db.js';

export async function getAll(req, res, next) {
  try {
    const { search, limit = 20 } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      take: Number(limit),
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isBlocked: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
}

export async function updateRole(req, res, next) {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
}

export async function toggleBlock(req, res, next) {
  try {
    const { isBlocked } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isBlocked } });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (e) { next(e); }
}
