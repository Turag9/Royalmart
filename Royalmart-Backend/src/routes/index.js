import { Router } from 'express';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import authRoutes from '../modules/auth/auth.routes.js';
import productRoutes from '../modules/products/product.routes.js';
import categoryRoutes from '../modules/categories/category.routes.js';
import orderRoutes from '../modules/orders/order.routes.js';
import reviewRoutes from '../modules/reviews/review.routes.js';
import wishlistRoutes from '../modules/wishlist/wishlist.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', authLimiter, authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/cart', cartRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
