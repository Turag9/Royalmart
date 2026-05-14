import { Router } from 'express';
import { placeOrder, myOrders, cancelOrder, removeOrder, updateStatus, getAllOrders } from './order.controller.js';
import { authenticate, adminOnly } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticate, adminOnly, getAllOrders);
router.post('/customer', authenticate, placeOrder);
router.get('/my-orders', authenticate, myOrders);
router.patch('/cancel/:orderNumber', authenticate, cancelOrder);
router.delete('/remove/:orderNumber', authenticate, removeOrder);
router.patch('/status/:id', authenticate, adminOnly, updateStatus);

export default router;
