import { Router } from 'express';
import * as controller from './review.controller.js';
import { ReviewCreateSchema } from './review.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

const router = Router();

router.get('/product/:productId', controller.getByProduct);
router.post('/', authenticate, validateBody(ReviewCreateSchema), controller.create);

export default router;
