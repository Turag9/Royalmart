import { asyncHandler } from '../../utils/asyncHandler.js';
import { setAuthCookie, clearAuthCookie } from '../../utils/cookie.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { token, user } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ success: true, token, data: user });
});

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.json({ success: true, token, data: user });
});

export const logout = (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out' });
};

export const profile = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  res.json({ success: true, data });
});
