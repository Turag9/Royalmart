import { asyncHandler } from '../../utils/asyncHandler.js';
import * as adminService from './admin.service.js';

export const dashboard = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await adminService.getOverview() });
});

export const getUsers = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await adminService.listUsers() });
});

export const getOrders = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await adminService.listOrders() });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const data = await adminService.updateOrderStatus(req.params.id, req.body.status);
  res.json({ success: true, data });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});
