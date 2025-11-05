import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from './test-utils.js';

describe('User Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users', () => {
    it('should get list of users', async () => {
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
      expect(body.users.length).toBeGreaterThan(0);

      const user = body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('isActive');
      expect(user).toHaveProperty('createdAt');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID', async () => {
      const userId = 'test-user-123';
      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${userId}`
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user.id).toBe(userId);
      expect(body.user).toHaveProperty('email');
      expect(body.user).toHaveProperty('username');
      expect(body.user).toHaveProperty('firstName');
      expect(body.user).toHaveProperty('lastName');
      expect(body.user).toHaveProperty('isActive');
      expect(body.user).toHaveProperty('createdAt');
      expect(body.user).toHaveProperty('updatedAt');
    });

    it('should handle different user IDs', async () => {
      const userId = 'another-user-456';
      const response = await app.inject({
        method: 'GET',
        url: `/api/users/${userId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user.id).toBe(userId);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user with all fields', async () => {
      const userId = 'test-user-123';
      const updateData = {
        email: 'updated@example.com',
        username: 'updateduser',
        firstName: 'Updated',
        lastName: 'User',
        isActive: false
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('message');
      expect(body.message).toBe('User updated successfully');
      expect(body).toHaveProperty('user');
      expect(body.user.id).toBe(userId);
      expect(body.user.email).toBe(updateData.email);
      expect(body.user.username).toBe(updateData.username);
    });

    it('should update user with partial fields', async () => {
      const userId = 'test-user-123';
      const updateData = {
        email: 'newemail@example.com'
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.user.email).toBe(updateData.email);
    });

    it('should reject invalid email format', async () => {
      const userId = 'test-user-123';
      const updateData = {
        email: 'invalid-email'
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject username that is too short', async () => {
      const userId = 'test-user-123';
      const updateData = {
        username: 'ab'
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject username that is too long', async () => {
      const userId = 'test-user-123';
      const updateData = {
        username: 'a'.repeat(31)
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(400);
    });

    it('should accept firstName and lastName in update', async () => {
      const userId = 'test-user-123';
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast'
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/users/${userId}`,
        payload: updateData
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('User updated successfully');
      expect(body.user.id).toBe(userId);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const userId = 'test-user-123';
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${userId}`
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('message');
      expect(body.message).toBe('User deleted successfully');
    });

    it('should handle deleting different user IDs', async () => {
      const userId = 'another-user-456';
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/users/${userId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('User deleted successfully');
    });
  });
});
