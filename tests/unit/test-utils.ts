import { FastifyInstance } from 'fastify';
import fastify from 'fastify';

export async function buildServer(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false, // Disable logging during tests
    trustProxy: true,
  });

  // Import and register middleware
  const { requestLogger } = await import('@/middleware/request-logger.js');
  await app.register(requestLogger);

  // Import and register routes
  const { healthRoutes } = await import('@/routes/health.js');
  const { authRoutes } = await import('@/routes/auth.js');
  const { userRoutes } = await import('@/routes/users.js');

  // Register routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });

  return app;
}