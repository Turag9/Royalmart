import { Router } from 'express';
import { getAll, updateRole, toggleBlock, remove } from './user.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticate, adminOnly, getAll);
router.patch('/role/:id', authenticate, adminOnly, updateRole);
router.patch('/block/:id', authenticate, adminOnly, toggleBlock);
router.delete('/:id', authenticate, adminOnly, remove);

export default router;
