import { Router } from 'express';
import { getAll, create, update, remove } from './category.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = Router();

router.get('/', getAll);
router.post('/', authenticate, adminOnly, create);
router.put('/:id', authenticate, adminOnly, update);
router.delete('/:id', authenticate, adminOnly, remove);

export default router;
