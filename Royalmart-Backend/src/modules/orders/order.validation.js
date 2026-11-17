import { z } from 'zod';
import { STATUS_MAP } from './order.constants.js';

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

export const AdminCreateOrderSchema = PlaceOrderSchema.extend({
  userId: z.string().uuid(),
});

const StatusField = z
  .string()
  .transform((v) => v.toUpperCase())
  .pipe(z.enum(Object.keys(STATUS_MAP)));

export const UpdateStatusSchema = z.object({ status: StatusField });

export const AdminUpdateOrderSchema = z
  .object({
    status: StatusField.optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const ListQuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});
