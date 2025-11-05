import { describe, it, expect } from 'vitest';
import { config } from '@/config/index.js';

describe('Config', () => {
  it('should export config object', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });

  it('should have NODE_ENV defined', () => {
    expect(config.NODE_ENV).toBeDefined();
    expect(['development', 'production', 'test']).toContain(config.NODE_ENV);
  });

  it('should have PORT defined', () => {
    expect(config.PORT).toBeDefined();
    expect(typeof config.PORT).toBe('number');
    expect(config.PORT).toBeGreaterThan(0);
  });

  it('should have HOST defined', () => {
    expect(config.HOST).toBeDefined();
    expect(typeof config.HOST).toBe('string');
  });

  it('should have DATABASE_URL defined', () => {
    expect(config.DATABASE_URL).toBeDefined();
    expect(typeof config.DATABASE_URL).toBe('string');
    expect(config.DATABASE_URL).toContain('postgresql://');
  });

  it('should have JWT configuration', () => {
    expect(config.JWT_SECRET).toBeDefined();
    expect(typeof config.JWT_SECRET).toBe('string');
    expect(config.JWT_SECRET.length).toBeGreaterThanOrEqual(32);

    expect(config.JWT_EXPIRES_IN).toBeDefined();
    expect(typeof config.JWT_EXPIRES_IN).toBe('string');
  });

  it('should have CORS configuration', () => {
    expect(config.CORS_ORIGIN).toBeDefined();
    expect(typeof config.CORS_ORIGIN).toBe('string');
  });

  it('should have rate limiting configuration', () => {
    expect(config.RATE_LIMIT_MAX_REQUESTS).toBeDefined();
    expect(typeof config.RATE_LIMIT_MAX_REQUESTS).toBe('number');
    expect(config.RATE_LIMIT_MAX_REQUESTS).toBeGreaterThan(0);

    expect(config.RATE_LIMIT_WINDOW_MS).toBeDefined();
    expect(typeof config.RATE_LIMIT_WINDOW_MS).toBe('number');
    expect(config.RATE_LIMIT_WINDOW_MS).toBeGreaterThan(0);
  });

  it('should have logging configuration', () => {
    expect(config.LOG_LEVEL).toBeDefined();
    expect(['error', 'warn', 'info', 'debug']).toContain(config.LOG_LEVEL);

    expect(config.LOG_FORMAT).toBeDefined();
    expect(['json', 'text']).toContain(config.LOG_FORMAT);
  });

  it('should have API documentation configuration', () => {
    expect(config.API_TITLE).toBeDefined();
    expect(typeof config.API_TITLE).toBe('string');

    expect(config.API_DESCRIPTION).toBeDefined();
    expect(typeof config.API_DESCRIPTION).toBe('string');

    expect(config.API_VERSION).toBeDefined();
    expect(typeof config.API_VERSION).toBe('string');
  });
});
