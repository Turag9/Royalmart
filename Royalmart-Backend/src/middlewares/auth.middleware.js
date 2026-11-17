import prisma from '../database/prisma.js';
import { ApiError } from '../errors/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';
import { COOKIE_NAME, ROLES } from '../config/constants.js';

/**
 * Verifies the JWT (cookie or Bearer header) and loads a fresh user record so
 * role demotion / blocking takes effect immediately.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;
  if (!token) throw ApiError.unauthorized('Not authenticated');

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, role: true, isBlocked: true },
  });

  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (user.isBlocked) throw ApiError.forbidden('Account is blocked');

  req.user = user;
  next();
});

export function adminOnly(req, _res, next) {
  if (req.user?.role !== ROLES.ADMIN) {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}
