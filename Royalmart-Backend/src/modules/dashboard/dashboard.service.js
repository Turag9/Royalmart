import prisma from '../../database/prisma.js';

const notCancelled = { status: { not: 'cancelled' } };

export async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalProducts, pendingOrders, cancelOrders, processingOrders, todayRevenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.order.count({ where: { status: 'confirmed' } }),
      prisma.order.aggregate({
        where: { ...notCancelled, createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
    ]);

  return {
    totalUsers,
    totalProducts,
    pendingOrders,
    cancelOrders,
    processingOrders,
    todayIncome: todayRevenue._sum.totalAmount || 0,
  };
}

export function getRecentOrders() {
  return prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
}

export function getSalesReport() {
  return prisma.order.findMany({
    where: notCancelled,
    select: { totalAmount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
}

export function getRevenueReport() {
  return prisma.order.findMany({
    where: notCancelled,
    select: { totalAmount: true, paymentMethod: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getAnalytics() {
  const [totalUsers, totalProducts, totalOrders, revenue, ordersByStatus] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: notCancelled, _sum: { totalAmount: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenue._sum.totalAmount || 0,
    orderStatusCounts: ordersByStatus,
  };
}
