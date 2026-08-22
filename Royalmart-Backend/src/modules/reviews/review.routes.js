import { Router } from 'express';
import { getByProduct, create, ReviewCreateSchema } from './review.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

const router = Router();

router.get('/product/:productId', getByProduct);
router.post('/', authenticate, validateBody(ReviewCreateSchema), create);

export default router;
