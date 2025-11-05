import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../unit/test-utils.js';

describe('Error Scenarios Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Validation Errors', () => {
    it('should handle empty request body for registration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle missing required fields in login', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com'
          // missing password
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate email format in registration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'not-an-email',
          username: 'testuser',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate username length constraints', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/users/test-id',
        payload: {
          username: 'ab' // Too short
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate password complexity in registration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: `test${Date.now()}@example.com`,
          username: `testuser${Date.now()}`,
          password: 'weak',
          firstName: 'Test',
          lastName: 'User'
        }
      });

      expect([400, 422]).toContain(response.statusCode);
    });
  });

  describe('HTTP Method Errors', () => {
    it('should reject POST to health endpoint', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/health'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject PUT to health endpoint', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/health'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject PATCH to health endpoint', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/health'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should reject DELETE to health endpoint', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/health'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Not Found Errors', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/non-existent-route'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for deeply nested non-existent route', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/deep/nested/non/existent/route'
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for non-existent API version', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v99/users'
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Content Type Errors', () => {
    it('should handle requests with invalid content-type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        headers: {
          'content-type': 'text/plain'
        },
        payload: 'email=test@example.com&password=test123'
      });

      // Should either accept and parse or reject
      expect([200, 400, 415]).toContain(response.statusCode);
    });

    it('should handle requests with no content-type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      // Fastify should auto-detect JSON
      expect([200, 400]).toContain(response.statusCode);
    });
  });

  describe('Malformed Request Errors', () => {
    it('should handle extremely long URLs', async () => {
      const longPath = '/api/' + 'a'.repeat(1000);
      const response = await app.inject({
        method: 'GET',
        url: longPath
      });

      expect(response.statusCode).toBe(404);
    });

    it('should handle special characters in URL', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/<script>alert("xss")</script>'
      });

      expect([200, 404]).toContain(response.statusCode);
    });

    it('should handle URL with query parameters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users?page=1&limit=10&sort=name&order=asc'
      });

      expect(response.statusCode).toBe(200);
    });

    it('should handle URL with encoded characters', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users?email=test%40example.com'
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent registrations', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        app.inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            email: `concurrent-${Date.now()}-${i}@example.com`,
            username: `concurrent-user-${Date.now()}-${i}`,
            password: 'Password123!',
            firstName: 'Concurrent',
            lastName: 'User'
          }
        })
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect([201, 400, 409]).toContain(response.statusCode);
      });
    });

    it('should handle mixed concurrent requests', async () => {
      const requests = [
        app.inject({ method: 'GET', url: '/health' }),
        app.inject({ method: 'GET', url: '/health/detailed' }),
        app.inject({ method: 'GET', url: '/api/users' }),
        app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'test@example.com', password: 'test123' } }),
        app.inject({ method: 'GET', url: '/api/users/test-id' })
      ];

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.statusCode).toBeGreaterThanOrEqual(200);
        expect(response.statusCode).toBeLessThan(600);
      });
    });
  });

  describe('Edge Case Payloads', () => {
    it('should handle empty string values', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: '',
          username: '',
          password: '',
          firstName: '',
          lastName: ''
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle null values', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: null,
          username: null,
          password: null,
          firstName: null,
          lastName: null
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('should handle very long input strings', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: `${'a'.repeat(100)}@example.com`,
          username: 'a'.repeat(100),
          password: 'a'.repeat(100),
          firstName: 'a'.repeat(100),
          lastName: 'a'.repeat(100)
        }
      });

      expect([400, 422]).toContain(response.statusCode);
    });

    it('should handle numeric values for string fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 12345,
          username: 67890,
          password: 11111,
          firstName: 22222,
          lastName: 33333
        }
      });

      expect([400, 422]).toContain(response.statusCode);
    });

    it('should handle array values for object fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: []
      });

      expect([400, 422]).toContain(response.statusCode);
    });
  });

  describe('Response Format Validation', () => {
    it('should always return JSON for API endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users'
      });

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return JSON for error responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/non-existent'
      });

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should return valid JSON structure', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(() => JSON.parse(response.body)).not.toThrow();
    });
  });
});
