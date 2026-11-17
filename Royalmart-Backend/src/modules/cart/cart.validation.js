import { z } from 'zod';

export const CartAddSchema = z.object({
  productId: z.string().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});
