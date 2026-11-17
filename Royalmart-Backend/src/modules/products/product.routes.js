import { Router } from 'express';
import * as controller from './product.controller.js';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductListQuerySchema,
} from './product.validation.js';
import { authenticate, adminOnly } from '../../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware.js';

const router = Router();

router.get('/', validateQuery(ProductListQuerySchema), controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', authenticate, adminOnly, validateBody(ProductCreateSchema), controller.create);
// PUT and PATCH both do a partial update so the admin frontend (PATCH) and
// older clients (PUT) keep working.
router.put('/:id', authenticate, adminOnly, validateBody(ProductUpdateSchema), controller.update);
router.patch('/:id', authenticate, adminOnly, validateBody(ProductUpdateSchema), controller.update);
router.delete('/:id', authenticate, adminOnly, controller.remove);

export default router;
