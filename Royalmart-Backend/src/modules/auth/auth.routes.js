import { Router } from 'express';
import * as controller from './auth.controller.js';
import { RegisterSchema, LoginSchema } from './auth.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';

const router = Router();

router.post('/register', validateBody(RegisterSchema), controller.register);
router.post('/login', validateBody(LoginSchema), controller.login);
router.post('/logout', controller.logout);
router.get('/profile', authenticate, controller.profile);

export default router;
