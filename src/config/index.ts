import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Validation schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('localhost'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'text']).default('json'),

  // API Documentation
  API_TITLE: z.string().default('Node.js Backend API'),
  API_DESCRIPTION: z
    .string()
    .default('Production-ready Node.js backend with TypeScript and Fastify'),
  API_VERSION: z.string().default('1.0.0')
});

// Validate environment variables
const validatedEnv = envSchema.parse(process.env);

export const config = {
  NODE_ENV: validatedEnv.NODE_ENV,
  PORT: validatedEnv.PORT,
  HOST: validatedEnv.HOST,
  DATABASE_URL: validatedEnv.DATABASE_URL,
  JWT_SECRET: validatedEnv.JWT_SECRET,
  JWT_EXPIRES_IN: validatedEnv.JWT_EXPIRES_IN,
  CORS_ORIGIN: validatedEnv.CORS_ORIGIN,
  RATE_LIMIT_MAX_REQUESTS: validatedEnv.RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS: validatedEnv.RATE_LIMIT_WINDOW_MS,
  LOG_LEVEL: validatedEnv.LOG_LEVEL,
  LOG_FORMAT: validatedEnv.LOG_FORMAT,
  API_TITLE: validatedEnv.API_TITLE,
  API_DESCRIPTION: validatedEnv.API_DESCRIPTION,
  API_VERSION: validatedEnv.API_VERSION
} as const;
