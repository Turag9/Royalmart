import { asyncHandler } from '../../utils/asyncHandler.js';
import * as productService from './product.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const { products, total, skip, limit } = await productService.list(req.query);
  res.json({ success: true, data: products, total, skip, limit });
});

export const getOne = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await productService.getById(req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await productService.create(req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await productService.update(req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});
