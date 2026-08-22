import { Router } from 'express';
import {
  getAll,
  create,
  update,
  remove,
  CategoryCreateSchema,
  CategoryUpdateSchema,
} from './category.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

const router = Router();

router.get('/', getAll);
router.post('/', authenticate, adminOnly, validateBody(CategoryCreateSchema), create);
router.put('/:id', authenticate, adminOnly, validateBody(CategoryUpdateSchema), update);
router.patch('/:id', authenticate, adminOnly, validateBody(CategoryUpdateSchema), update);
router.delete('/:id', authenticate, adminOnly, remove);

export default router;
