import { env } from '../config/env.js';
import { COOKIE_NAME, COOKIE_MAX_AGE_MS } from '../config/constants.js';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

export const setAuthCookie = (res, token) => res.cookie(COOKIE_NAME, token, cookieOptions());
export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions());
