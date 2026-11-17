import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

// In dev with --watch the entry script is re-evaluated on every change, which
// would create a new PrismaClient (and connection pool) each time. Cache the
// client on globalThis so reloads share it.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: env.isDevelopment ? ['warn', 'error'] : ['error'],
  });

if (!env.isProduction) {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
