import { Router } from 'express';
import * as controller from './user.controller.js';
import { ListQuerySchema, RoleUpdateSchema, BlockUpdateSchema } from './user.validation.js';
import { authenticate, adminOnly } from '../../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/', validateQuery(ListQuerySchema), controller.getAll);
router.patch('/role/:id', validateBody(RoleUpdateSchema), controller.updateRole);
router.patch('/block/:id', validateBody(BlockUpdateSchema), controller.toggleBlock);
router.delete('/:id', controller.remove);

export default router;
