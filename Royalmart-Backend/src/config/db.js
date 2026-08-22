import { PrismaClient } from '@prisma/client';

// In dev with --watch, the entry script gets re-evaluated on every file change
// which would otherwise create a brand new PrismaClient (and a new connection
// pool) each time. We cache the client on globalThis so reloads share it.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
