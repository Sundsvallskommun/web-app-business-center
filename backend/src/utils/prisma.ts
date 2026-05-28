import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  global.prisma ??= new PrismaClient();
  prisma = global.prisma;
}

export default prisma;
