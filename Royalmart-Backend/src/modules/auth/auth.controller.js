import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../../config/db.js';

const BCRYPT_ROUNDS = 12;

export const RegisterSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional().nullable(),
  email: z.string().trim().toLowerCase().email().max(254),
  // 8+ chars, must contain a letter and a number — modest baseline.
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/\d/, 'Password must contain a number'),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setTokenCookie(res, token) {
  res.cookie('token', token, getCookieOptions());
}

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { firstName, lastName: lastName || null, email, password: hashed },
    });

    const token = signToken(user);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user.id,
        displayName: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    setTokenCookie(res, token);

    res.json({
      success: true,
      token,
      data: {
        id: user.id,
        displayName: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function logout(_req, res) {
  res.clearCookie('token', getCookieOptions());
  res.json({ success: true, message: 'Logged out' });
}

export async function profile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      data: { ...user, displayName: `${user.firstName} ${user.lastName || ''}`.trim() },
    });
  } catch (e) {
    next(e);
  }
}
