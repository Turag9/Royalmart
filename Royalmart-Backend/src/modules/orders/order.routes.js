import { Router } from 'express';
import * as controller from './order.controller.js';
import {
  PlaceOrderSchema,
  UpdateStatusSchema,
  AdminUpdateOrderSchema,
  AdminCreateOrderSchema,
  ListQuerySchema,
} from './order.validation.js';
import { authenticate, adminOnly } from '../../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware.js';

const router = Router();

// Customer
router.post('/customer', authenticate, validateBody(PlaceOrderSchema), controller.placeOrder);
router.get('/my-orders', authenticate, controller.myOrders);
router.patch('/cancel/:orderNumber', authenticate, controller.cancelOrder);
router.delete('/remove/:orderNumber', authenticate, controller.removeOrder);

// Admin
router.get('/', authenticate, adminOnly, validateQuery(ListQuerySchema), controller.getAllOrders);
router.post('/', authenticate, adminOnly, validateBody(AdminCreateOrderSchema), controller.adminCreateOrder);
router.patch('/status/:id', authenticate, adminOnly, validateBody(UpdateStatusSchema), controller.updateStatus);
router.patch('/:id', authenticate, adminOnly, validateBody(AdminUpdateOrderSchema), controller.adminUpdateOrder);

export default router;
