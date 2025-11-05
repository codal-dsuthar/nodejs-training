import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../unit/test-utils.js';

describe('API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check Endpoints', () => {
    it('GET /health - should return OK status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toMatchObject({
        status: 'ok',
        version: '1.0.0'
      });
      expect(['development', 'test']).toContain(body.environment);
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
    });

    it('GET /health/detailed - should return detailed health info', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('memory');
      expect(body.database).toHaveProperty('status');
      expect(body.database).toHaveProperty('responseTime');
    });
  });

  describe('Authentication Flow', () => {
    it('POST /api/auth/register - should register new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: `test${Date.now()}@example.com`,
          username: `testuser${Date.now()}`,
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('email');
      expect(body.user).toHaveProperty('username');
    });

    it('POST /api/auth/login - should login user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'user@example.com',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('user');
    });

    it('POST /api/auth/logout - should logout user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.message).toBe('Logged out successfully');
    });
  });

  describe('User Management', () => {
    it('GET /api/users - should list all users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('users');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('limit');
      expect(Array.isArray(body.users)).toBe(true);
    });

    it('GET /api/users/:id - should get specific user', async () => {
      const userId = 'test-123';
      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${userId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('user');
      expect(body.user.id).toBe(userId);
    });

    it('PATCH /api/users/:id - should update user', async () => {
      const userId = 'test-123';
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: {
          email: 'updated@example.com',
          username: 'updateduser'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.message).toBe('User updated successfully');
      expect(body.user).toHaveProperty('id');
    });

    it('DELETE /api/users/:id - should delete user', async () => {
      const userId = 'test-123';
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${userId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.message).toBe('User deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/non-existent'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid request body', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          // Missing required fields
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'invalid-email',
          username: 'testuser',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('API Response Format', () => {
    it('should return JSON content-type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should include timestamp in responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('timestamp');
      expect(new Date(body.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        app.inject({
          method: 'GET',
          url: '/health'
        })
      );

      const responses = await Promise.all(requests);

      // All should succeed (under rate limit)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.statusCode);
      });
    });
  });
});
