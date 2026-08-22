import { Router } from 'express';
import { register, login, logout, profile, RegisterSchema, LoginSchema } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

const router = Router();

router.post('/register', validateBody(RegisterSchema), register);
router.post('/login', validateBody(LoginSchema), login);
router.post('/logout', logout);
router.get('/profile', authenticate, profile);

export default router;
