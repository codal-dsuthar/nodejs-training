import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '@/middleware/error-handler.js';
import { FastifyError } from 'fastify';

describe('Error Handler Middleware', () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      params: {},
      query: {},
      body: {},
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent'
      }
    };

    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
  });

  describe('Validation Errors', () => {
    it('should handle validation errors', () => {
      const error = {
        name: 'ValidationError',
        message: 'Validation failed',
        validation: [
          {
            instancePath: '/email',
            message: 'must be string',
            schemaPath: '#/properties/email/type',
            params: { type: 'string' }
          }
        ]
      } as any;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          message: 'Request validation failed',
          details: expect.any(Array)
        })
      );
    });
  });

  describe('HTTP Status Codes', () => {
    it('should handle 400 Bad Request', () => {
      const error = {
        name: 'BadRequest',
        message: 'Invalid request',
        statusCode: 400
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Invalid request'
      });
    });

    it('should handle 401 Unauthorized', () => {
      const error = {
        name: 'Unauthorized',
        message: 'Not authenticated',
        statusCode: 401
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Not authenticated'
      });
    });

    it('should handle 401 with default message', () => {
      const error = {
        name: 'Unauthorized',
        message: '',
        statusCode: 401
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    });

    it('should handle 403 Forbidden', () => {
      const error = {
        name: 'Forbidden',
        message: 'Access denied',
        statusCode: 403
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Access denied'
      });
    });

    it('should handle 404 Not Found', () => {
      const error = {
        name: 'NotFound',
        message: 'Resource not found',
        statusCode: 404
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Not Found',
        message: 'Resource not found'
      });
    });

    it('should handle 409 Conflict', () => {
      const error = {
        name: 'Conflict',
        message: 'User already exists',
        statusCode: 409
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(409);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'User already exists'
      });
    });

    it('should handle 422 Unprocessable Entity', () => {
      const error = {
        name: 'UnprocessableEntity',
        message: 'Cannot process',
        statusCode: 422
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(422);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Unprocessable Entity',
        message: 'Cannot process'
      });
    });

    it('should handle 429 Too Many Requests', () => {
      const error = {
        name: 'TooManyRequests',
        message: 'Rate limit exceeded',
        statusCode: 429
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(429);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded'
      });
    });

    it('should handle 500 Internal Server Error in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = {
        name: 'InternalError',
        message: 'Database connection failed',
        statusCode: 500
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Database connection failed'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Generic Errors', () => {
    it('should handle generic errors without statusCode', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should handle errors with custom statusCode', () => {
      const error = {
        name: 'CustomError',
        message: 'Custom error message',
        statusCode: 418
      } as FastifyError;

      errorHandler(error, mockRequest, mockReply);

      expect(mockReply.code).toHaveBeenCalledWith(418);
    });
  });
});
