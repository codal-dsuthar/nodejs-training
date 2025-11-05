import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from './test-utils.js';

describe('Health Routes - Detailed', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status with all required fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Verify all fields
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('ok');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('environment');
    });

    it('should return valid timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      const body = JSON.parse(response.body);
      const timestamp = new Date(body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return positive uptime', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      const body = JSON.parse(response.body);
      expect(body.uptime).toBeGreaterThan(0);
      expect(typeof body.uptime).toBe('number');
    });

    it('should return version string', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      const body = JSON.parse(response.body);
      expect(body.version).toBeDefined();
      expect(typeof body.version).toBe('string');
      expect(body.version.length).toBeGreaterThan(0);
    });

    it('should return environment', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      const body = JSON.parse(response.body);
      expect(body.environment).toBeDefined();
      expect(['development', 'test', 'production']).toContain(body.environment);
    });

    it('should handle multiple rapid requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        app.inject({
          method: 'GET',
          url: '/health'
        })
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Verify main fields
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('environment');
    });

    it('should include database health information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('database');
      expect(body.database).toHaveProperty('status');
      expect(body.database).toHaveProperty('responseTime');
    });

    it('should include memory information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('memory');
      expect(body.memory).toHaveProperty('used');
      expect(body.memory).toHaveProperty('total');
      expect(body.memory).toHaveProperty('percentage');
    });

    it('should have valid memory values', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      const body = JSON.parse(response.body);
      expect(body.memory.used).toBeGreaterThan(0);
      expect(body.memory.total).toBeGreaterThan(0);
      expect(body.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(body.memory.percentage).toBeLessThanOrEqual(100);
      expect(body.memory.used).toBeLessThanOrEqual(body.memory.total);
    });

    it('should include database response time', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      const body = JSON.parse(response.body);
      expect(body.database.responseTime).toBeDefined();
      expect(typeof body.database.responseTime).toBe('number');
      expect(body.database.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle database connection status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      const body = JSON.parse(response.body);
      expect(['connected', 'disconnected', 'error']).toContain(body.database.status);
    });

    it('should return consistent data structure on multiple calls', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      const response2 = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      // Should have same structure
      expect(Object.keys(body1).sort()).toEqual(Object.keys(body2).sort());
      expect(Object.keys(body1.database).sort()).toEqual(Object.keys(body2.database).sort());
      expect(Object.keys(body1.memory).sort()).toEqual(Object.keys(body2.memory).sort());
    });
  });

  describe('Health Endpoint Edge Cases', () => {
    it('should handle HEAD request to /health', async () => {
      const response = await app.inject({
        method: 'HEAD',
        url: '/health'
      });

      // HEAD should return same status but no body
      expect([200, 404, 405]).toContain(response.statusCode);
    });

    it('should reject POST to /health', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/health'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject PUT to /health', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/health'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject DELETE to /health', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/health'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return JSON content-type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should handle concurrent detailed health checks', async () => {
      const requests = Array.from({ length: 10 }, () =>
        app.inject({
          method: 'GET',
          url: '/health/detailed'
        })
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.database).toBeDefined();
        expect(body.memory).toBeDefined();
      });
    });
  });
});
