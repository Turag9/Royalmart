import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import userRoutes from './modules/users/user.routes.js';
import dashboardRoutes from './modules/admin/dashboard.routes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
