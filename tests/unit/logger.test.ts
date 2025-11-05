import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { logger } from '@/utils/logger.js';

describe('Logger', () => {
  let originalEnv: string;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV || 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Logger Instance', () => {
    it('should have basic logging methods', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should have Fastify-compatible methods', () => {
      expect(logger.fatal).toBeDefined();
      expect(logger.trace).toBeDefined();
    });

    it('should log info messages', () => {
      expect(() => {
        logger.info('Test info message');
      }).not.toThrow();
    });

    it('should log error messages', () => {
      expect(() => {
        logger.error('Test error message');
      }).not.toThrow();
    });

    it('should log warning messages', () => {
      expect(() => {
        logger.warn('Test warning message');
      }).not.toThrow();
    });

    it('should log debug messages', () => {
      expect(() => {
        logger.debug('Test debug message');
      }).not.toThrow();
    });

    it('should log with metadata', () => {
      expect(() => {
        logger.info('Test message with metadata', {
          userId: '123',
          action: 'test',
          timestamp: new Date().toISOString()
        });
      }).not.toThrow();
    });

    it('should log errors with stack traces', () => {
      const error = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', { error });
      }).not.toThrow();
    });
  });

  describe('Fastify Compatibility', () => {
    it('should support fatal method (alias for error)', () => {
      expect(() => {
        logger.fatal('Fatal error message');
      }).not.toThrow();
    });

    it('should support trace method (alias for debug)', () => {
      expect(() => {
        logger.trace('Trace message');
      }).not.toThrow();
    });

    it('should log with request context', () => {
      expect(() => {
        logger.info('Request processed', {
          requestId: 'req-123',
          method: 'GET',
          url: '/api/test',
          statusCode: 200,
          duration: '45ms'
        });
      }).not.toThrow();
    });
  });

  describe('Log Levels', () => {
    it('should support error level', () => {
      expect(() => {
        logger.error('Error level test');
      }).not.toThrow();
    });

    it('should support warn level', () => {
      expect(() => {
        logger.warn('Warning level test');
      }).not.toThrow();
    });

    it('should support info level', () => {
      expect(() => {
        logger.info('Info level test');
      }).not.toThrow();
    });

    it('should support debug level', () => {
      expect(() => {
        logger.debug('Debug level test');
      }).not.toThrow();
    });
  });

  describe('Structured Logging', () => {
    it('should log structured data', () => {
      expect(() => {
        logger.info('User action', {
          userId: 'user-123',
          action: 'login',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        });
      }).not.toThrow();
    });

    it('should log with nested objects', () => {
      expect(() => {
        logger.info('Complex event', {
          user: {
            id: '123',
            email: 'user@example.com'
          },
          request: {
            method: 'POST',
            url: '/api/auth/login'
          }
        });
      }).not.toThrow();
    });

    it('should log arrays', () => {
      expect(() => {
        logger.info('Multiple items', {
          items: ['item1', 'item2', 'item3'],
          count: 3
        });
      }).not.toThrow();
    });
  });

  describe('Error Logging', () => {
    it('should log Error objects', () => {
      const error = new Error('Test error');
      expect(() => {
        logger.error('Error occurred', { error });
      }).not.toThrow();
    });

    it('should log errors with additional context', () => {
      const error = new Error('Database connection failed');
      expect(() => {
        logger.error('Database error', {
          error,
          database: 'postgresql',
          host: 'localhost',
          port: 5432
        });
      }).not.toThrow();
    });

    it('should log custom error properties', () => {
      const error: any = new Error('API error');
      error.statusCode = 500;
      error.code = 'INTERNAL_ERROR';
      expect(() => {
        logger.error('API error occurred', { error });
      }).not.toThrow();
    });
  });

  describe('Performance Logging', () => {
    it('should log duration metrics', () => {
      const start = Date.now();
      // Simulate some work
      const duration = Date.now() - start;

      expect(() => {
        logger.info('Operation completed', {
          operation: 'data-processing',
          duration: `${duration}ms`
        });
      }).not.toThrow();
    });

    it('should log with timestamps', () => {
      expect(() => {
        logger.info('Timed event', {
          timestamp: new Date().toISOString(),
          event: 'user-login'
        });
      }).not.toThrow();
    });
  });
});
