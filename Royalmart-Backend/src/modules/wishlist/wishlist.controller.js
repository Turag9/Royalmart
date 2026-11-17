import { asyncHandler } from '../../utils/asyncHandler.js';
import * as wishlistService from './wishlist.service.js';

export const getAll = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await wishlistService.list(req.user.id) });
});

export const add = asyncHandler(async (req, res) => {
  const data = await wishlistService.add(req.user.id, req.body.productId);
  res.status(201).json({ success: true, data });
});

export const toggle = asyncHandler(async (req, res) => {
  const added = await wishlistService.toggle(req.user.id, req.body.productId);
  res.json({
    success: true,
    message: added ? 'Added to wishlist' : 'Removed from wishlist',
    added,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await wishlistService.remove(req.user.id, req.params.id);
  res.json({ success: true, message: 'Removed from wishlist' });
});
