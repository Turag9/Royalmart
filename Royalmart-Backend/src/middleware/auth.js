import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}
