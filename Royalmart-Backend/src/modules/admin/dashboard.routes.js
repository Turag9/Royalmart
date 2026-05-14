import { Router } from 'express';
import prisma from '../../config/db.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/stats', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalProducts, pendingOrders, cancelOrders, processingOrders, todayRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.order.count({ where: { status: 'confirmed' } }),
      prisma.order.aggregate({ where: { status: { not: 'cancelled' }, createdAt: { gte: today } }, _sum: { totalAmount: true } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalProducts, pendingOrders, cancelOrders, processingOrders, todayIncome: todayRevenue._sum.totalAmount || 0 } });
  } catch (e) { next(e); }
});

router.get('/recent-orders', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ success: true, data: orders });
  } catch (e) { next(e); }
});

router.get('/sales-report', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: 'cancelled' } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: orders });
  } catch (e) { next(e); }
});

router.get('/revenue-report', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: 'cancelled' } },
      select: { totalAmount: true, paymentMethod: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: orders });
  } catch (e) { next(e); }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenue, ordersByStatus] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: { not: 'cancelled' } }, _sum: { totalAmount: true } }),
      prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalProducts, totalOrders, totalRevenue: revenue._sum.totalAmount || 0, orderStatusCounts: ordersByStatus } });
  } catch (e) { next(e); }
});

export default router;
