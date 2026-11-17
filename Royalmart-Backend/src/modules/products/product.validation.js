import { z } from 'zod';

export const ProductCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().positive(),
  discountPercentage: z.number().min(0).max(100).default(0),
  rating: z.number().min(0).max(5).optional(),
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().uuid().optional().nullable(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.string().max(500).optional(),
  brand: z.string().max(500).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
});
