import { Router } from 'express';
import { getAll, toggle, remove } from './wishlist.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAll);
router.post('/toggle', authenticate, toggle);
router.delete('/:productId', authenticate, remove);

export default router;
