import { Router } from 'express';
import {
  placeOrder,
  myOrders,
  cancelOrder,
  removeOrder,
  updateStatus,
  getAllOrders,
  adminUpdateOrder,
  adminCreateOrder,
  PlaceOrderSchema,
  UpdateStatusSchema,
  AdminUpdateOrderSchema,
  AdminCreateOrderSchema,
  ListQuerySchema,
} from './order.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';

const router = Router();

router.get('/', authenticate, adminOnly, validateQuery(ListQuerySchema), getAllOrders);
router.post('/customer', authenticate, validateBody(PlaceOrderSchema), placeOrder);
router.get('/my-orders', authenticate, myOrders);
router.patch('/cancel/:orderNumber', authenticate, cancelOrder);
router.delete('/remove/:orderNumber', authenticate, removeOrder);
router.patch('/status/:id', authenticate, adminOnly, validateBody(UpdateStatusSchema), updateStatus);

// Admin convenience endpoints used by the admin frontend.
router.patch('/:id', authenticate, adminOnly, validateBody(AdminUpdateOrderSchema), adminUpdateOrder);
router.post('/', authenticate, adminOnly, validateBody(AdminCreateOrderSchema), adminCreateOrder);

export default router;
