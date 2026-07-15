const { PrismaClient } = require('@prisma/client');

// Single shared Prisma instance (avoids exhausting DB connections on hot reload)
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

module.exports = prisma;
