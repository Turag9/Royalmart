import prisma from '../../config/db.js';

export async function getAllOrders(req, res, next) {
  try {
    const { status, limit = 20 } = req.query;
    const where = {};
    if (status) {
      const statusMap = { PENDING: 'pending', PROCESSING: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' };
      where.status = statusMap[status] || status.toLowerCase();
    } else {
      where.status = { not: 'cancelled' };
    }

    const orders = await prisma.order.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ success: true, data: orders });
  } catch (e) { next(e); }
}

export async function placeOrder(req, res, next) {
  try {
    const { totalAmount, paymentMethod, shippingAddress, itemsSummary } = req.body;
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount: Number(totalAmount),
        paymentMethod: paymentMethod || 'cod',
        shippingAddress: shippingAddress || {},
        notes: itemsSummary || null,
      },
    });
    res.status(201).json({ success: true, data: order });
  } catch (e) { next(e); }
}

export async function myOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id, status: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
    });
    const mapped = orders.map((o) => ({ ...o, status: o.status.toUpperCase() }));
    res.json({ success: true, data: mapped });
  } catch (e) { next(e); }
}

export async function cancelOrder(req, res, next) {
  try {
    const order = await prisma.order.findFirst({ where: { orderNumber: req.params.orderNumber, userId: req.user.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await prisma.order.update({ where: { id: order.id }, data: { status: 'cancelled' } });
    res.json({ success: true, message: 'Order cancelled' });
  } catch (e) { next(e); }
}

export async function removeOrder(req, res, next) {
  try {
    const order = await prisma.order.findFirst({ where: { orderNumber: req.params.orderNumber, userId: req.user.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await prisma.order.delete({ where: { id: order.id } });
    res.json({ success: true, message: 'Order removed' });
  } catch (e) { next(e); }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const statusMap = { PENDING: 'pending', PROCESSING: 'confirmed', SHIPPED: 'shipped', DELIVERED: 'delivered', CANCELLED: 'cancelled' };
    const mapped = statusMap[status] || status.toLowerCase();
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: mapped } });
    res.json({ success: true, data: order });
  } catch (e) { next(e); }
}
