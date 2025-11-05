import { FastifyError, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

import { config } from '@/config/index.js';
import { logger } from '@/utils/logger.js';

interface CustomError extends Error {
  statusCode?: number;
  validation?: Array<{
    instancePath: string;
    message: string;
    schemaPath?: string;
    params?: Record<string, unknown>;
  }>;
}

export function errorHandler(
  this: FastifyInstance,
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const err = error as CustomError;

  // Log the error
  logger.error('Request error', {
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      validation: err.validation
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      body: request.body,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    }
  });

  // Fastify validation errors
  if (err.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: 'Request validation failed',
      details: err.validation.map(v => ({
        field: v.instancePath || v.schemaPath,
        message: v.message,
        provided: v.params?.providedValue,
        expected: v.params?.allowedValues
      }))
    });
  }

  // Fastify specific errors
  if ('statusCode' in err) {
    switch (err.statusCode) {
      case 400:
        return reply.code(400).send({
          error: 'Bad Request',
          message: err.message
        });

      case 401:
        return reply.code(401).send({
          error: 'Unauthorized',
          message: err.message || 'Authentication required'
        });

      case 403:
        return reply.code(403).send({
          error: 'Forbidden',
          message: err.message || 'Access denied'
        });

      case 404:
        return reply.code(404).send({
          error: 'Not Found',
          message: err.message || 'Resource not found'
        });

      case 409:
        return reply.code(409).send({
          error: 'Conflict',
          message: err.message || 'Resource conflict'
        });

      case 422:
        return reply.code(422).send({
          error: 'Unprocessable Entity',
          message: err.message || 'Request could not be processed'
        });

      case 429:
        return reply.code(429).send({
          error: 'Too Many Requests',
          message: err.message || 'Rate limit exceeded'
        });

      case 500:
      default:
        return reply.code(err.statusCode || 500).send({
          error: 'Internal Server Error',
          message:
            config.NODE_ENV === 'production'
              ? 'Something went wrong'
              : err.message || 'Internal server error'
        });
    }
  }

  // Generic server error
  return reply.code(500).send({
    error: 'Internal Server Error',
    message:
      config.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message || 'Internal server error'
  });
}
