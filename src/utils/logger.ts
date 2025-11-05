import { mkdirSync } from 'fs';

import { createLogger, format, transports } from 'winston';

import { config } from '@/config/index.js';

// Custom log format
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.errors({ stack: true }),
  format.json()
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({
    format: 'HH:mm:ss'
  }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Create logger instance
export const logger = createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: 'nodejs-backend',
    version: config.API_VERSION
  },
  transports: [
    // Console transport
    new transports.Console({
      format: consoleFormat,
      level: config.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),

    // Error logs to file (production)
    ...(config.NODE_ENV === 'production'
      ? [
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
      : [])
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new transports.Console(),
    ...(config.NODE_ENV === 'production'
      ? [new transports.File({ filename: 'logs/exceptions.log' })]
      : [])
  ],

  // Handle unhandled rejections
  rejectionHandlers: [
    new transports.Console(),
    ...(config.NODE_ENV === 'production'
      ? [new transports.File({ filename: 'logs/rejections.log' })]
      : [])
  ]
});

// Create logs directory if it doesn't exist
try {
  mkdirSync('logs', { recursive: true });
} catch {
  // Ignore if directory already exists
}

// Add Fastify-compatible methods
// @ts-ignore
logger.fatal = logger.error;
// @ts-ignore
logger.trace = logger.debug;
