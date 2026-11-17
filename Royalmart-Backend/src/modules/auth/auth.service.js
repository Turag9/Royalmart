import bcrypt from 'bcryptjs';
import prisma from '../../database/prisma.js';
import { ApiError } from '../../errors/ApiError.js';
import { BCRYPT_ROUNDS } from '../../config/constants.js';
import { signToken } from '../../utils/jwt.js';
import { displayName } from '../../utils/displayName.js';

export async function register({ firstName, lastName, email, password }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw ApiError.conflict('Email already registered');

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { firstName, lastName: lastName || null, email, password: hashed },
  });

  return {
    token: signToken(user),
    user: {
      id: user.id,
      displayName: displayName(user),
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (user.isBlocked) throw ApiError.forbidden('Account is blocked');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  return {
    token: signToken(user),
    user: {
      id: user.id,
      displayName: displayName(user),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  if (!user) throw ApiError.notFound('User not found');
  return { ...user, displayName: displayName(user) };
}
