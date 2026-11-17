import { Router } from 'express';
import * as controller from './cart.controller.js';
import { CartAddSchema } from './cart.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', validateBody(CartAddSchema), controller.add);
router.delete('/:id', controller.remove);

export default router;
