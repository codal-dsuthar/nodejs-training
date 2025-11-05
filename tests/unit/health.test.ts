import { describe, it, expect } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from './test-utils.js';

describe('Server Health Check', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('environment');
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
      expect(body.status).toBe('ok');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('version');
      expect(body).toHaveProperty('environment');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('memory');
      
      expect(body.database).toHaveProperty('status');
      expect(body.database).toHaveProperty('responseTime');
      expect(body.memory).toHaveProperty('used');
      expect(body.memory).toHaveProperty('total');
      expect(body.memory).toHaveProperty('percentage');
    });
  });
});