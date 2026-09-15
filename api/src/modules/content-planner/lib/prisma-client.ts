import { PrismaClient } from '@prisma/client-content-planner';

const globalForPrisma = global as unknown as { prismaContentPlanner: PrismaClient };

export const prisma = globalForPrisma.prismaContentPlanner || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaContentPlanner = prisma;

export default prisma;
