import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import userRoutes from './modules/users/user.routes.js';
import dashboardRoutes from './modules/admin/dashboard.routes.js';

const app = express();

// Behind a proxy (Vercel, Render, Nginx) we need this so secure cookies and
// rate-limit-by-ip work correctly.
app.set('trust proxy', 1);

app.use(helmet());

// CORS_ORIGIN can be a single origin or comma-separated list. Empty / unset
// falls back to localhost dev origin.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // server-to-server, curl, Postman
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Tight throttle on auth endpoints to slow down brute force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests / 15 min / IP across login+register+logout
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
