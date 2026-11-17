import { Router } from 'express';
import * as controller from './dashboard.controller.js';
import { authenticate, adminOnly } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/stats', controller.stats);
router.get('/recent-orders', controller.recentOrders);
router.get('/sales-report', controller.salesReport);
router.get('/revenue-report', controller.revenueReport);
router.get('/analytics', controller.analytics);

export default router;
