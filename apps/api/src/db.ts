import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & { neiaPrisma?: PrismaClient };
export const prisma = globalForPrisma.neiaPrisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.neiaPrisma = prisma;
