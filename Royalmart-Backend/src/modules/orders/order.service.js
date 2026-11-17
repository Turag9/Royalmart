import prisma from '../../database/prisma.js';
import { ApiError } from '../../errors/ApiError.js';
import { STATUS_MAP, CONVENIENCE_FEE, TOTAL_TOLERANCE } from './order.constants.js';

const USER_SUMMARY = { select: { firstName: true, lastName: true, email: true } };

/**
 * Recomputes the total server-side (items + fixed convenience fee) and rejects
 * when it disagrees with the client by more than TOTAL_TOLERANCE — prevents
 * trivial price spoofing.
 */
function computeVerifiedTotal(items, clientTotal) {
  const itemsTotal = items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
  const expected = itemsTotal + CONVENIENCE_FEE;
  if (Math.abs(expected - clientTotal) > TOTAL_TOLERANCE) {
    throw ApiError.badRequest('Order total does not match items');
  }
  return Number(expected.toFixed(2));
}

function buildOrderData(userId, { items, totalAmount, paymentMethod, shippingAddress }) {
  return {
    userId,
    totalAmount: computeVerifiedTotal(items, totalAmount),
    paymentMethod: String(paymentMethod).toLowerCase(),
    shippingAddress: shippingAddress || {},
    itemsSnapshot: items, // full snapshot so history works for external products
    notes: items.map((i) => i.name).filter(Boolean).join(', ') || null,
  };
}

export function listAll({ status, limit }) {
  const where = {
    status: status ? STATUS_MAP[status.toUpperCase()] || status.toLowerCase() : { not: 'cancelled' },
  };
  return prisma.order.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: USER_SUMMARY },
  });
}

/** Every order incl. cancelled (admin overview). */
export function listEvery() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: USER_SUMMARY },
  });
}

export async function listMine(userId) {
  const orders = await prisma.order.findMany({
    where: { userId, status: { not: 'cancelled' } },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map((o) => ({ ...o, status: o.status.toUpperCase() }));
}

/** Customer checkout; also clears the server-side cart in the same transaction. */
export function place(userId, input) {
  const data = buildOrderData(userId, input);
  return prisma.$transaction(async (tx) => {
    const created = await tx.order.create({ data });
    await tx.cart.deleteMany({ where: { userId } });
    return created;
  });
}

/** Admin manual order creation for any user (cart untouched). */
export function createForUser({ userId, ...input }) {
  return prisma.order.create({ data: buildOrderData(userId, input) });
}

async function findOwnedOrder(userId, orderNumber) {
  const order = await prisma.order.findFirst({ where: { orderNumber, userId } });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}

export async function cancel(userId, orderNumber) {
  const order = await findOwnedOrder(userId, orderNumber);
  await prisma.order.update({ where: { id: order.id }, data: { status: 'cancelled' } });
}

export async function removeOwned(userId, orderNumber) {
  const order = await findOwnedOrder(userId, orderNumber);
  await prisma.order.delete({ where: { id: order.id } });
}

export function updateStatus(id, status) {
  return prisma.order.update({ where: { id }, data: { status: STATUS_MAP[status] } });
}

export function adminUpdate(id, { status, notes }) {
  const data = {};
  if (status) data.status = STATUS_MAP[status];
  if (notes !== undefined) data.notes = notes;
  return prisma.order.update({ where: { id }, data });
}
