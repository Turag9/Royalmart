import { Router } from 'express';
import { register, login, logout, profile } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authenticate, profile);

export default router;
