import { FastifyInstance } from 'fastify';
import { app } from '@/server.js';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getTestServer(): Promise<FastifyInstance> {
  await app.ready();
  return app;
}

export async function cleanupDatabase() {
  // Clean up test data
  // Add your cleanup logic here when you have database tables
  // Example:
  // await prisma.user.deleteMany({});
}

export async function closeTestServer() {
  await app.close();
  await prisma.$disconnect();
}
