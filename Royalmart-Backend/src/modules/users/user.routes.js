import { Router } from 'express';
import {
  getAll,
  updateRole,
  toggleBlock,
  remove,
  ListQuerySchema,
  RoleUpdateSchema,
  BlockUpdateSchema,
} from './user.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';

const router = Router();

router.get('/', authenticate, adminOnly, validateQuery(ListQuerySchema), getAll);
router.patch('/role/:id', authenticate, adminOnly, validateBody(RoleUpdateSchema), updateRole);
router.patch('/block/:id', authenticate, adminOnly, validateBody(BlockUpdateSchema), toggleBlock);
router.delete('/:id', authenticate, adminOnly, remove);

export default router;
