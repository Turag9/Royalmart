import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'firstName, email, password required' });
    }

    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email: email.toLowerCase(), password: hashed },
    });

    const token = signToken(user);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      data: { id: user.id, displayName: `${user.firstName} ${user.lastName || ''}`.trim(), email: user.email, createdAt: user.createdAt },
    });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = signToken(user);
    setTokenCookie(res, token);

    res.json({
      success: true,
      data: { id: user.id, displayName: `${user.firstName} ${user.lastName || ''}`.trim(), email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (e) { next(e); }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
}

export async function profile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, phone: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { ...user, displayName: `${user.firstName} ${user.lastName || ''}`.trim() } });
  } catch (e) { next(e); }
}
