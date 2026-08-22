import { z } from 'zod';
import prisma from '../../config/db.js';

const STATUS_MAP = {
  PENDING: 'pending',
  PROCESSING: 'confirmed',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const UpdateOrderStatusSchema = z.object({
  status: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum(Object.keys(STATUS_MAP))),
});

export async function dashboard(_req, res, next) {
  try {
    const [totalUsers, totalProducts, totalOrders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
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
  } catch (e) {
    next(e);
  }
}

export async function getUsers(_req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
}

export async function getOrders(_req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ success: true, data: orders });
  } catch (e) {
    next(e);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const status = STATUS_MAP[req.body.status];
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (e) {
    next(e);
  }
}
