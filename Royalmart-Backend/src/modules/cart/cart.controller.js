import { asyncHandler } from '../../utils/asyncHandler.js';
import * as cartService from './cart.service.js';

export const getAll = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await cartService.list(req.user.id) });
});

export const add = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await cartService.add(req.user.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  const clear = req.query.clear === 'true';
  const { removed, item } = await cartService.remove(req.user.id, req.params.id, clear);

  if (removed) return res.json({ success: true, message: 'Removed from cart', removed: true });
  res.json({ success: true, message: 'Cart item decremented', data: item, removed: false });
});
