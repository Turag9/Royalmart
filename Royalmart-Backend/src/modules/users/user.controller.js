import { asyncHandler } from '../../utils/asyncHandler.js';
import * as userService from './user.service.js';

export const getAll = asyncHandler(async (req, res) => {
  const data = await userService.list(req.query);
  res.json({ success: true, data });
});

export const updateRole = asyncHandler(async (req, res) => {
  const data = await userService.updateRole(req.params.id, req.body.role);
  res.json({ success: true, data });
});

export const toggleBlock = asyncHandler(async (req, res) => {
  const data = await userService.setBlocked(req.params.id, req.body.isBlocked);
  res.json({ success: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});
