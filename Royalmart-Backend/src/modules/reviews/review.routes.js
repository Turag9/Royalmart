import { Router } from 'express';
import { getByProduct, create } from './review.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getByProduct);
router.post('/', authenticate, create);

export default router;
