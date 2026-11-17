import { Router } from 'express';
import * as controller from './category.controller.js';
import { CategoryCreateSchema, CategoryUpdateSchema } from './category.validation.js';
import { authenticate, adminOnly } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

const router = Router();

router.get('/', controller.getAll);
router.post('/', authenticate, adminOnly, validateBody(CategoryCreateSchema), controller.create);
router.put('/:id', authenticate, adminOnly, validateBody(CategoryUpdateSchema), controller.update);
router.patch('/:id', authenticate, adminOnly, validateBody(CategoryUpdateSchema), controller.update);
router.delete('/:id', authenticate, adminOnly, controller.remove);

export default router;
