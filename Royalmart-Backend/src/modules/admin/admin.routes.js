import { Router } from 'express';
import * as controller from './admin.controller.js';
import { UpdateStatusSchema } from '../orders/order.validation.js';
import { authenticate, adminOnly } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/dashboard', controller.dashboard);
router.get('/users', controller.getUsers);
router.get('/orders', controller.getOrders);
router.patch('/orders/:id/status', validateBody(UpdateStatusSchema), controller.updateOrderStatus);
router.delete('/users/:id', controller.deleteUser);

export default router;
