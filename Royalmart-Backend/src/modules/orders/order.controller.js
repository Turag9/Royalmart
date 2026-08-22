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
const VALID_BACKEND_STATUSES = new Set(Object.values(STATUS_MAP));
const CONVENIENCE_FEE = 99;
// Tolerance for client/server total mismatch caused by float rounding. We
// reject anything outside this window — the goal is to catch obvious price
// spoofing, not fight floats.
const TOTAL_TOLERANCE = 1; // currency units

const OrderItemSchema = z.object({
  productId: z.string().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(99),
  price: z.coerce.number().nonnegative(),
  name: z.string().max(200).optional(),
  image: z.string().max(2000).optional(),
});

export const PlaceOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1).max(50),
  totalAmount: z.coerce.number().positive(),
  paymentMethod: z.string().min(1).max(40),
  shippingAddress: z
    .object({
      address: z.string().max(500).optional(),
      city: z.string().max(120).optional(),
      area: z.string().max(120).optional(),
      phone: z.string().max(30).optional(),
    })
    .optional()
    .nullable(),
});

export const UpdateStatusSchema = z.object({
  status: z
    .string()
    .transform((v) => v.toUpperCase())
    .pipe(z.enum(Object.keys(STATUS_MAP))),
});

export const AdminUpdateOrderSchema = z
  .object({
    status: UpdateStatusSchema.shape.status.optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const ListQuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export async function getAllOrders(req, res, next) {
  try {
    const { status, limit } = req.query;
    const where = {};
    if (status) {
      where.status = STATUS_MAP[status.toUpperCase()] || status.toLowerCase();
    } else {
      where.status = { not: 'cancelled' };
    }

    const orders = await prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ success: true, data: orders });
  } catch (e) {
    next(e);
  }
}

/**
 * Customer order placement.
 *
 * The client sends the cart items and a computed total. The server recomputes
 * the total from the same items (including a fixed convenience fee) and
 * rejects when the two disagree by more than TOTAL_TOLERANCE — this prevents
 * trivial price spoofing without depending on the local Product table being
 * the source of truth.
 *
 * The full items list is also stored as `itemsSnapshot` so order history can
 * reconstruct what was bought even when products come from an external API.
 */
export async function placeOrder(req, res, next) {
  try {
    const { items, totalAmount, paymentMethod, shippingAddress } = req.body;

    const computedItemsTotal = items.reduce(
      (sum, it) => sum + Number(it.price) * Number(it.quantity),
      0
    );
    const expectedTotal = computedItemsTotal + CONVENIENCE_FEE;

    if (Math.abs(expectedTotal - totalAmount) > TOTAL_TOLERANCE) {
      return res.status(400).json({
        success: false,
        message: 'Order total does not match items',
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount: Number(expectedTotal.toFixed(2)),
          paymentMethod: String(paymentMethod).toLowerCase(),
          shippingAddress: shippingAddress || {},
          itemsSnapshot: items, // full snapshot for history rendering
          notes: items.map((i) => i.name).filter(Boolean).join(', ') || null,
        },
      });
      // Clear the user's cart server-side so the next login does not bring the
      // already-placed items back.
      await tx.cart.deleteMany({ where: { userId: req.user.id } });
      return created;
    });

    res.status(201).json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
}

export async function myOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id, status: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
    });
    const mapped = orders.map((o) => ({ ...o, status: o.status.toUpperCase() }));
    res.json({ success: true, data: mapped });
  } catch (e) {
    next(e);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber: req.params.orderNumber, userId: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await prisma.order.update({ where: { id: order.id }, data: { status: 'cancelled' } });
    res.json({ success: true, message: 'Order cancelled' });
  } catch (e) {
    next(e);
  }
}

export async function removeOrder(req, res, next) {
  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber: req.params.orderNumber, userId: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await prisma.order.delete({ where: { id: order.id } });
    res.json({ success: true, message: 'Order removed' });
  } catch (e) {
    next(e);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const mapped = STATUS_MAP[status];
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: mapped },
    });
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
}

/**
 * Admin-only generic update. Currently supports `status` and `notes`. Used by
 * the admin frontend's `PATCH /api/orders/:id`.
 */
export async function adminUpdateOrder(req, res, next) {
  try {
    const data = {};
    if (req.body.status) {
      data.status = STATUS_MAP[req.body.status];
      if (!VALID_BACKEND_STATUSES.has(data.status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
    }
    if (req.body.notes !== undefined) data.notes = req.body.notes;

    const order = await prisma.order.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
}

/**
 * Admin-only manual order creation. Mirrors `placeOrder` but accepts a
 * `userId` and skips the cart clear.
 */
export const AdminCreateOrderSchema = PlaceOrderSchema.extend({
  userId: z.string().uuid(),
});

export async function adminCreateOrder(req, res, next) {
  try {
    const { userId, items, totalAmount, paymentMethod, shippingAddress } = req.body;

    const computedItemsTotal = items.reduce(
      (sum, it) => sum + Number(it.price) * Number(it.quantity),
      0
    );
    const expectedTotal = computedItemsTotal + CONVENIENCE_FEE;

    if (Math.abs(expectedTotal - totalAmount) > TOTAL_TOLERANCE) {
      return res.status(400).json({ success: false, message: 'Order total does not match items' });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: Number(expectedTotal.toFixed(2)),
        paymentMethod: String(paymentMethod).toLowerCase(),
        shippingAddress: shippingAddress || {},
        itemsSnapshot: items,
        notes: items.map((i) => i.name).filter(Boolean).join(', ') || null,
      },
    });
    res.status(201).json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
}
