import { asyncHandler } from '../../utils/asyncHandler.js';
import * as reviewService from './review.service.js';

export const getByProduct = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await reviewService.listByProduct(req.params.productId) });
});

export const create = asyncHandler(async (req, res) => {
  const data = await reviewService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data });
});
