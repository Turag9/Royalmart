import { Router } from 'express';
import { dashboard, getUsers, getOrders, updateOrderStatus, deleteUser } from './admin.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/dashboard', dashboard);
router.get('/users', getUsers);
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/users/:id', deleteUser);

export default router;
