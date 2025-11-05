import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import fastify from 'fastify';

import { config } from './config/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import { authRoutes } from './routes/auth.js';
import { healthRoutes } from './routes/health.js';
import { userRoutes } from './routes/users.js';
import { logger } from './utils/logger.js';

// Create Fastify instance
const app = fastify({
  // Fastify expects a Pino-compatible logger; cast our Winston logger to FastifyBaseLogger to satisfy types.
  logger: logger as unknown as import('fastify').FastifyBaseLogger,
  trustProxy: true,
  bodyLimit: 10485760 // 10MB
});

// Register plugins
async function registerPlugins() {
  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  });

  // CORS
  await app.register(cors, {
    origin: config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: `${config.RATE_LIMIT_WINDOW_MS} milliseconds`,
    errorResponseBuilder: function (_request, context) {
      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${context.ttl} seconds`,
        statusCode: 429,
        expiresIn: context.ttl
      };
    }
  });

  // Request logging
  await app.register(requestLogger);

  // API Documentation
  await app.register(swagger, {
    swagger: {
      info: {
        title: config.API_TITLE,
        description: config.API_DESCRIPTION,
        version: config.API_VERSION,
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      host: `${config.HOST}:${config.PORT}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Authorization: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'JWT token. Format: Bearer <token>'
        }
      }
    }
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true,
    transformSpecification: (swaggerObject, _request, _reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  });

  // Error handler
  app.setErrorHandler(errorHandler);
}

// Register routes
async function registerRoutes() {
  // Health check
  await app.register(healthRoutes, { prefix: '/health' });

  // API routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
}

// Start server
async function start() {
  try {
    // Register all plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Start listening
    await app.listen({
      port: config.PORT,
      host: config.HOST
    });

    app.log.info(`🚀 Server listening on http://${config.HOST}:${config.PORT}`);
    app.log.info(`📖 API Documentation available at http://${config.HOST}:${config.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  app.log.info('SIGINT received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  app.log.info('SIGTERM received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
// If this file is run directly, start the server.
// Use CommonJS-compatible check so TypeScript doesn't require ESM module settings.
declare const require: NodeRequire | undefined;
if (typeof require !== 'undefined' && require && require.main === module) {
  start();
}

export { app };
