import { z } from 'zod';

export const WishlistAddSchema = z.object({
  productId: z.string().min(1).max(120),
});
