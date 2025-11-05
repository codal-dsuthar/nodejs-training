import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  const prisma = new PrismaClient();

  app.get(
    '/',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Basic health check to verify the service is running',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok'] },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              version: { type: 'string' },
              environment: { type: 'string' }
            }
          }
        }
      }
    },
    async (_request, _reply) => {
      const uptime = process.uptime();

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.round(uptime * 100) / 100, // Round to 2 decimal places
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      };
    }
  );

  app.get(
    '/detailed',
    {
      schema: {
        tags: ['Health'],
        summary: 'Detailed health check',
        description: 'Extended health check including database connectivity',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ok'] },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              version: { type: 'string' },
              environment: { type: 'string' },
              database: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['connected', 'disconnected'] },
                  responseTime: { type: 'number' }
                }
              },
              memory: {
                type: 'object',
                properties: {
                  used: { type: 'number' },
                  total: { type: 'number' },
                  percentage: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    async (_request, _reply) => {
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();
      const memTotal = memUsage.heapTotal;
      const memUsed = memUsage.heapUsed;
      const memPercentage = (memUsed / memTotal) * 100;

      // Check database connectivity
      let dbStatus = 'disconnected';
      let dbResponseTime = 0;

      try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbResponseTime = Date.now() - start;
        dbStatus = 'connected';
      } catch (error) {
        // Log with object first to match logger overloads
        app.log.error({ error }, 'Database health check failed');
      }

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.round(uptime * 100) / 100, // Round to 2 decimal places
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: dbStatus,
          responseTime: dbResponseTime
        },
        memory: {
          used: memUsed,
          total: memTotal,
          percentage: Math.round(memPercentage * 100) / 100
        }
      };
    }
  );

  // Graceful shutdown when closing
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}
