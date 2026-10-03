import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Configure database URL with sensible pooling options for Neon + small Render instance:
 * - connection_limit=10:
 *   For a small Render instance (e.g. Starter/Standard 512MB RAM, single Node.js process),
 *   capping Prisma Client's connection pool to 10 prevents container memory bloat
 *   (each open connection consumes socket buffers and database memory). Since Node.js
 *   handles asynchronous I/O concurrently on an event loop, 10 active connections
 *   comfortably serve 100+ concurrent requests while staying well within Neon PgBouncer limits.
 * - pool_timeout=20:
 *   Neon serverless PostgreSQL automatically suspends idle compute endpoints.
 *   Waking up from suspension (cold start) typically takes 1–3 seconds. A pool_timeout
 *   of 20 seconds ensures transient connection acquisition queues during compute wake-up
 *   or traffic spikes do not throw premature P2024 timeouts, while still failing fast enough
 *   before upstream HTTP proxy timeouts (Render 100s, browser ~30s).
 */
function getDatasourceUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', process.env.DATABASE_CONNECTION_LIMIT || '10');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', process.env.DATABASE_POOL_TIMEOUT || '20');
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatasourceUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

