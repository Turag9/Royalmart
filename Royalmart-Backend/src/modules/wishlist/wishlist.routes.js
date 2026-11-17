import { Router } from 'express';
import * as controller from './wishlist.controller.js';
import { WishlistAddSchema } from './wishlist.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', validateBody(WishlistAddSchema), controller.add);
router.post('/toggle', validateBody(WishlistAddSchema), controller.toggle);
router.delete('/:id', controller.remove);

export default router;
