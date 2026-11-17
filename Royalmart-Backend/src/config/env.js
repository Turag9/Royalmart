/**
 * Central place for every environment variable the app reads.
 * Getters are used (instead of snapshotting at import time) so values loaded
 * later by Prisma / the host platform are still picked up.
 */
export const env = {
  get nodeEnv() {
    return process.env.NODE_ENV || 'development';
  },
  get isProduction() {
    return this.nodeEnv === 'production';
  },
  get isDevelopment() {
    return this.nodeEnv === 'development';
  },
  get port() {
    return Number(process.env.PORT) || 5000;
  },
  get jwtSecret() {
    return process.env.JWT_SECRET;
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  get corsOrigins() {
    return (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''))
      .filter(Boolean);
  },
};
