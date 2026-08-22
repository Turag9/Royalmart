import { Router } from 'express';
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductListQuerySchema,
} from './product.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';

const router = Router();

router.get('/', validateQuery(ProductListQuerySchema), getAll);
router.get('/:id', getOne);
router.post('/', authenticate, adminOnly, validateBody(ProductCreateSchema), create);
// Both PUT and PATCH supported for partial update so admin frontend (PATCH)
// and any older clients (PUT) keep working.
router.put('/:id', authenticate, adminOnly, validateBody(ProductUpdateSchema), update);
router.patch('/:id', authenticate, adminOnly, validateBody(ProductUpdateSchema), update);
router.delete('/:id', authenticate, adminOnly, remove);

export default router;
