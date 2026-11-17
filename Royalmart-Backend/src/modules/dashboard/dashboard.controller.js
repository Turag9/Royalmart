import { asyncHandler } from '../../utils/asyncHandler.js';
import * as dashboardService from './dashboard.service.js';

const respond = (fn) =>
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: await fn() });
  });

export const stats = respond(dashboardService.getStats);
export const recentOrders = respond(dashboardService.getRecentOrders);
export const salesReport = respond(dashboardService.getSalesReport);
export const revenueReport = respond(dashboardService.getRevenueReport);
export const analytics = respond(dashboardService.getAnalytics);
