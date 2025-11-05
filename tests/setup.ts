import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/index.js';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db';

// Global test database connection
export const prisma = new PrismaClient();

// Setup test database before all tests
beforeAll(async () => {
  // Clean database before running tests
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.config.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.file.deleteMany();
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.config.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.file.deleteMany();
});