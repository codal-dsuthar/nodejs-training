import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';

// Set test environment variables BEFORE importing config
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/test_db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-min-32-chars-long-for-testing';
process.env.JWT_EXPIRES_IN = '24h';
process.env.PORT = '3000';
process.env.HOST = 'localhost';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.LOG_LEVEL = 'error';
process.env.LOG_FORMAT = 'json';

// Global test database connection
export const prisma = new PrismaClient();

// Helper function to clean database safely
async function cleanDatabase() {
  try {
    // Clean database in correct order (respecting foreign key constraints)
    await prisma.userSession.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.file.deleteMany();
    await prisma.config.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
  } catch (error) {
    // If tables don't exist, we'll let the error propagate
    // This typically means the database needs to be migrated
    // eslint-disable-next-line no-console
    console.error('Failed to clean database. Did you run migrations?', error);
    throw error;
  }
}

// Setup test database before all tests
beforeAll(async () => {
  // Clean database before running tests
  await cleanDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
  await cleanDatabase();
});