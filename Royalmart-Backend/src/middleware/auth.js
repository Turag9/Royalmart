import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

/**
 * Verifies the JWT cookie and loads a fresh user record. Live DB check makes
 * sure that role demotion / blocking takes effect immediately instead of
 * waiting for the token to expire.
 */
export async function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isBlocked: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}
