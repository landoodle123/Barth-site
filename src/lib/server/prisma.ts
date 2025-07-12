// src/lib/server/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // optional: shows queries in console
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
