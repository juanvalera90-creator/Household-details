import { PrismaClient } from '@prisma/client';

/** Single shared Prisma client instance (avoids exhausting DB connections). */
export const prisma = new PrismaClient();
