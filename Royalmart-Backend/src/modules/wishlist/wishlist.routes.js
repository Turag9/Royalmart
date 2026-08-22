import { Router } from 'express';
import { getAll, add, toggle, remove, WishlistAddSchema } from './wishlist.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

const router = Router();

router.get('/', authenticate, getAll);
router.post('/', authenticate, validateBody(WishlistAddSchema), add);
router.post('/toggle', authenticate, validateBody(WishlistAddSchema), toggle);
router.delete('/:id', authenticate, remove);

export default router;
