# Node.js Backend - Professional Production-Ready Setup

A comprehensive, production-ready Node.js backend application built with modern technologies and best practices. This repository provides a solid foundation for building scalable, secure, and maintainable APIs.

## Features

### Core Technologies

* **Node.js 20+** with TypeScript for type safety and modern JavaScript features
* **Fastify** framework for high-performance API development
* **Prisma ORM** with PostgreSQL for robust database management
* **Zod** for runtime type validation
* **Vitest** for comprehensive testing

### Security & Quality

* **JWT Authentication** with secure token management
* **Role-based Access Control (RBAC)** for fine-grained permissions
* **API Key Management** for external integrations
* **Rate Limiting** and security headers (Helmet)
* **Input validation** and sanitization
* **SQL injection protection** through Prisma

### Developer Experience

* **Hot reload** for development with `tsx`
* **ESLint & Prettier** for code quality and formatting
* **Husky** pre-commit hooks for automated quality checks
* **Comprehensive testing** (unit, integration, e2e)
* **API documentation** with Swagger/OpenAPI
* **Docker & Docker Compose** for consistent environments

### Production Ready

* **CI/CD pipeline** with GitHub Actions
* **Docker containerization** with multi-stage builds
* **Health checks** and monitoring endpoints
* **Structured logging** with Winston
* **Error handling** and recovery
* **Performance optimization** and caching

## Prerequisites

* **Node.js 20+** and npm 10+
* **Docker & Docker Compose** (for database and development)
* **Git** for version control
* **PostgreSQL 15+** (via Docker)

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd backend
npm install
cp .env.example .env
```

### 2. Start Database

```bash
npm run docker:up
```

### 3. Database Setup

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server: `http://localhost:3000`
Docs: `http://localhost:3000/docs`

### 5. Run Tests

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/
├── .github/workflows/
├── commits/
└── docs/
```

## API Endpoints

### Health Check

* `GET /health`
* `GET /health/detailed`

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`

### Users

* `GET /api/users`
* `GET /api/users/:id`
* `PATCH /api/users/:id`
* `DELETE /api/users/:id`

### Documentation

* `GET /docs`

## Development Commands

```bash
# Development
npm run dev
npm run build
npm start

# Database
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
npm run db:seed

# Testing
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage

# Code Quality
npm run lint
npm run lint:fix
npm run format

# Docker
npm run docker:up
npm run docker:down
```

## Environment Variables

| Variable         | Description           | Default                                       |
| ---------------- | --------------------- | --------------------------------------------- |
| `NODE_ENV`       | Environment mode      | `development`                                 |
| `PORT`           | Server port           | `3000`                                        |
| `HOST`           | Server host           | `localhost`                                   |
| `DATABASE_URL`   | PostgreSQL connection | Required                                      |
| `JWT_SECRET`     | JWT signing secret    | Required                                      |
| `JWT_EXPIRES_IN` | Token expiration      | `24h`                                         |
| `CORS_ORIGIN`    | Allowed origins       | `http://localhost:3000,http://localhost:5173` |

## Docker Services

* **PostgreSQL 15**
* **Redis 7**
* **Adminer** (port 8080)

Access Adminer at `http://localhost:8080`
Credentials:

* System: PostgreSQL
* Server: postgres
* Username: postgres
* Password: password
* Database: nodejs_backend

## Testing Strategy

### Types

1. Unit Tests
2. Integration Tests
3. End-to-End Tests

### Coverage Goals

* Branches: 80%
* Functions: 80%
* Lines: 80%
* Statements: 80%

### Commands

```bash
npm test -- --watch
npm test auth.test.ts
npm run test:coverage
npm run test:coverage -- --reporter=html
```

## Deployment

### Docker Production Build

```bash
docker build -t nodejs-backend .
docker run -p 3000:3000 --env-file .env nodejs-backend
```

### Steps

1. Set production environment variables
2. Configure PostgreSQL
3. Set up SSL certificates
4. Configure reverse proxy (Nginx)
5. Enable monitoring and logging

## Performance & Monitoring

### Health Checks

* `/health`
* `/health/detailed`

### Logging

* Structured JSON logs with Winston
* Request and error tracking
* Performance metrics

### Security

* Helmet.js headers
* CORS configuration
* Rate limiting
* Input validation

