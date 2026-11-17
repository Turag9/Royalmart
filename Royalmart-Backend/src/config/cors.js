import cors from 'cors';
import { env } from './env.js';

export const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // server-to-server, curl, Postman
    if (env.corsOrigins.includes(origin)) return cb(null, true);
    console.warn(`CORS blocked origin ${origin}. Allowed: ${env.corsOrigins.join(', ')}`);
    return cb(null, false);
  },
  credentials: true,
});
