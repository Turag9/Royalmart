import { asyncHandler } from '../../utils/asyncHandler.js';
import * as orderService from './order.service.js';

export const getAllOrders = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await orderService.listAll(req.query) });
});

export const placeOrder = asyncHandler(async (req, res) => {
  const data = await orderService.place(req.user.id, req.body);
  res.status(201).json({ success: true, data });
});

export const myOrders = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await orderService.listMine(req.user.id) });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  await orderService.cancel(req.user.id, req.params.orderNumber);
  res.json({ success: true, message: 'Order cancelled' });
});

export const removeOrder = asyncHandler(async (req, res) => {
  await orderService.removeOwned(req.user.id, req.params.orderNumber);
  res.json({ success: true, message: 'Order removed' });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const data = await orderService.updateStatus(req.params.id, req.body.status);
  res.json({ success: true, data });
});

export const adminUpdateOrder = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await orderService.adminUpdate(req.params.id, req.body) });
});

export const adminCreateOrder = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await orderService.createForUser(req.body) });
});
