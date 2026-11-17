import rateLimit from 'express-rate-limit';

// Tight throttle on auth endpoints against brute force / credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // per IP per 15 min across login+register+logout
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});
