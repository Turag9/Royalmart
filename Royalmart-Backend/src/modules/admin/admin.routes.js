import { Router } from 'express';
import {
  dashboard,
  getUsers,
  getOrders,
  updateOrderStatus,
  deleteUser,
  UpdateOrderStatusSchema,
} from './admin.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/dashboard', dashboard);
router.get('/users', getUsers);
router.get('/orders', getOrders);
router.patch('/orders/:id/status', validateBody(UpdateOrderStatusSchema), updateOrderStatus);
router.delete('/users/:id', deleteUser);

export default router;
