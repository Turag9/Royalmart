import { asyncHandler } from '../../utils/asyncHandler.js';
import * as categoryService from './category.service.js';

export const getAll = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await categoryService.list() });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await categoryService.create(req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await categoryService.update(req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});
