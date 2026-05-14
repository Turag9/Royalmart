import { Router } from 'express';
import { getAll, getOne, create, update, remove } from './product.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authenticate, adminOnly, create);
router.put('/:id', authenticate, adminOnly, update);
router.delete('/:id', authenticate, adminOnly, remove);

export default router;
