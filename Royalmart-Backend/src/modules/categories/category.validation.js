import { z } from 'zod';

export const CategoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  parentId: z.string().uuid().optional().nullable(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();
