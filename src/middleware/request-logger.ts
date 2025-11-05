import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '@/utils/logger.js';

export async function requestLogger(app: FastifyInstance) {
  app.addHook(
    'onRequest',
    async (
      request: FastifyRequest & { startTime?: number; requestId?: string },
      reply: FastifyReply
    ) => {
      const start = Date.now();
      const requestId = Math.random().toString(36).substr(2, 9);

      // Add request ID and start time for tracing
      request.requestId = requestId;
      // store start time so onResponse/onError can compute duration
      request.startTime = start;
      reply.header('X-Request-ID', requestId);

      // Log incoming request
      logger.info('Incoming request', {
        requestId,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        contentType: request.headers['content-type'],
        contentLength: request.headers['content-length'],
        query: request.query,
        params: request.params
      });
    }
  );

  app.addHook(
    'onResponse',
    async (
      request: FastifyRequest & { startTime?: number; requestId?: string },
      reply: FastifyReply
    ) => {
      const duration = Date.now() - (request.startTime || Date.now());
      const requestId = request.requestId;

      // Log response
      logger.info('Request completed', {
        requestId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: `${duration}ms`,
        contentLength: reply.getHeader('content-length') || 0
      });
    }
  );

  app.addHook(
    'onError',
    async (
      request: FastifyRequest & { startTime?: number; requestId?: string },
      _reply: FastifyReply,
      error: Error & { statusCode?: number }
    ) => {
      const duration = Date.now() - (request.startTime || Date.now());
      const requestId = request.requestId;

      // Log error
      const errInfo = error as unknown as { stack?: string; statusCode?: number };
      logger.error('Request failed', {
        requestId,
        method: request.method,
        url: request.url,
        error: {
          message: error.message,
          stack: errInfo.stack,
          statusCode: errInfo.statusCode
        },
        duration: `${duration}ms`
      });
    }
  );
}
