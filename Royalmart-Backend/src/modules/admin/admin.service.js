import prisma from '../../database/prisma.js';
import * as userService from '../users/user.service.js';
import * as orderService from '../orders/order.service.js';

export async function getOverview() {
  const [totalUsers, totalProducts, totalOrders, revenue, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { not: 'cancelled' } }, _sum: { totalAmount: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    }),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenue._sum.totalAmount || 0,
    recentOrders,
  };
}

export const listUsers = () => userService.listAll();
export const listOrders = () => orderService.listEvery();
export const updateOrderStatus = (id, status) => orderService.updateStatus(id, status);
export const deleteUser = (id) => userService.remove(id);
