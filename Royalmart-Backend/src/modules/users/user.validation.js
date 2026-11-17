import { z } from 'zod';
import { ROLES } from '../../config/constants.js';

export const ListQuerySchema = z.object({
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20),
});

export const RoleUpdateSchema = z.object({
  role: z.enum(Object.values(ROLES)),
});

export const BlockUpdateSchema = z.object({
  isBlocked: z.boolean(),
});
