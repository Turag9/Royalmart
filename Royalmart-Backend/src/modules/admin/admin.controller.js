import prisma from '../../config/db.js';

export async function dashboard(req, res, next) {
  try {
    const [totalUsers, totalProducts, totalOrders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: { not: 'cancelled' } }, _sum: { totalAmount: true } }),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenue._sum.totalAmount || 0,
        recentOrders,
      },
    });
  } catch (e) { next(e); }
}

export async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ success: true, data: orders });
  } catch (e) { next(e); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
}

export async function deleteUser(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (e) { next(e); }
}
