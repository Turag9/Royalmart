import { Router } from 'express';
import { getAll, add, remove, CartAddSchema } from './cart.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

const router = Router();

router.get('/', authenticate, getAll);
router.post('/', authenticate, validateBody(CartAddSchema), add);
router.delete('/:id', authenticate, remove);

export default router;
