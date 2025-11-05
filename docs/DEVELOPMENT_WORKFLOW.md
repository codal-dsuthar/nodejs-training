# Development Workflow Guide

This guide outlines the development workflow for the Node.js backend project, including best practices, conventions, and processes for efficient team collaboration.

## 🚀 Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development environment
npm run docker:up
npm run db:migrate
npm run dev
```

### 2. Feature Development Workflow

#### Starting a New Feature
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes according to session instructions
# Follow the commit message convention from the session files

# Stage and commit changes
git add .
git commit -m "feat: descriptive commit message"

# Push branch
git push origin feature/your-feature-name
```

#### Session-Based Development
1. Navigate to the relevant session file in `/commits/`
2. Follow the detailed instructions step-by-step
3. Complete all tasks in the session checklist
4. Use the provided commit message
5. Move to the next session

### 3. Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

#### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

#### Examples
```bash
# Feature implementation
git commit -m "feat: implement user authentication endpoint"

# Bug fix
git commit -m "fix: resolve JWT token expiration issue"

# Documentation update
git commit -m "docs: update API documentation for user endpoints"

# Test addition
git commit -m "test: add unit tests for auth middleware"
```

### 4. Code Quality Standards

#### TypeScript Guidelines
- Use strict type checking
- Define interfaces for all data structures
- Use proper error handling with typed errors
- Leverage TypeScript's advanced types when appropriate

#### Code Style
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Keep functions small and focused
- Document complex logic with comments

#### Testing Requirements
- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 5. Database Development

#### Schema Changes
```bash
# Create a new migration
npx prisma migrate dev --name descriptive-migration-name

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client after schema changes
npm run db:generate

# Open Prisma Studio for visual database editing
npm run db:studio
```

#### Best Practices
- Always create migrations for schema changes
- Test migrations in development before applying to production
- Use descriptive migration names
- Keep migrations small and focused

### 6. API Development

#### Endpoint Design Principles
- Use RESTful conventions
- Implement proper HTTP status codes
- Validate all inputs with Zod schemas
- Provide meaningful error messages
- Document endpoints with OpenAPI/Swagger

#### Response Format
```typescript
// Success response
{
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}

// Error response
{
  "error": "Error Type",
  "message": "Descriptive error message",
  "details": {
    // Additional error context
  }
}
```

### 7. Testing Workflow

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

#### Test Writing
- Place unit tests in `tests/unit/`
- Place integration tests in `tests/integration/`
- Place e2e tests in `tests/e2e/`
- Use descriptive test names that explain the scenario
- Mock external dependencies

#### Test Example
```typescript
describe('User Authentication', () => {
  it('should authenticate user with valid credentials', async () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'password123' };
    
    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: userData
    });
    
    // Assert
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('token');
    expect(body.user.email).toBe(userData.email);
  });
});
```

### 8. Review Process

#### Before Submitting a PR
1. Run all tests: `npm test`
2. Check linting: `npm run lint`
3. Format code: `npm run format`
4. Review your changes in Git diff
5. Update documentation if needed

#### Pull Request Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 9. Environment Management

#### Development
- Use Docker Compose for consistent environment
- Use environment variables for configuration
- Keep `.env` in `.gitignore`
- Use `.env.example` for template

#### Production
- Use environment variables (never commit secrets)
- Enable HTTPS in production
- Use production database with proper backups
- Monitor application performance and errors

### 10. Performance Considerations

#### Database Optimization
- Use database indexes for frequently queried fields
- Implement pagination for large result sets
- Use connection pooling
- Monitor slow queries

#### Application Performance
- Implement caching strategies
- Use rate limiting for API endpoints
- Optimize JSON serialization
- Monitor memory usage

#### Caching Strategy
```typescript
// Example caching implementation
const cachedData = await redis.get(`user:${userId}`);
if (cachedData) {
  return JSON.parse(cachedData);
}

const userData = await fetchUserData(userId);
await redis.setex(`user:${userId}`, 3600, JSON.stringify(userData));
return userData;
```

### 11. Security Best Practices

#### Authentication & Authorization
- Use secure JWT secrets (32+ characters)
- Implement proper token expiration
- Use role-based access control
- Validate all user inputs

#### Data Protection
- Sanitize database inputs (Prisma handles this)
- Use HTTPS in production
- Implement rate limiting
- Log security events

#### API Security
```typescript
// Example middleware for authentication
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});
```

### 12. Monitoring & Logging

#### Logging
- Use structured logging with Winston
- Log important business events
- Log errors with stack traces
- Avoid logging sensitive information

#### Health Monitoring
- Implement health check endpoints
- Monitor database connectivity
- Track application performance
- Set up error alerting

#### Example Health Check
```typescript
app.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await checkDatabaseHealth()
  };
});
```

### 13. Deployment Checklist

#### Pre-deployment
- [ ] All tests pass
- [ ] Code is reviewed and approved
- [ ] Documentation is updated
- [ ] Environment variables are configured
- [ ] Database migrations are ready
- [ ] SSL certificates are configured

#### Post-deployment
- [ ] Health checks are passing
- [ ] Database connectivity is working
- [ ] Authentication is functioning
- [ ] API endpoints are responding
- [ ] Monitoring and logging are working
- [ ] Performance is within acceptable limits

### 14. Troubleshooting Guide

#### Common Issues

**Database Connection Issues**
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Reset database
npm run db:reset
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>
```

**Prisma Issues**
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database and migrations
npm run db:reset
```

#### Getting Help
1. Check the troubleshooting guide
2. Review session documentation
3. Check application logs
4. Create an issue with detailed information

---

## 📋 Development Checklist

### Daily Workflow
- [ ] Pull latest changes from main branch
- [ ] Start development server (`npm run dev`)
- [ ] Work on assigned session tasks
- [ ] Run tests frequently (`npm test`)
- [ ] Commit changes with conventional messages
- [ ] Push changes to remote branch

### Before Submitting PR
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Self-review completed
- [ ] No console.log statements in production code

### After Merging
- [ ] Delete feature branch locally and remotely
- [ ] Update local main branch
- [ ] Deploy to staging environment
- [ ] Verify deployment in staging

This workflow ensures consistent, high-quality development and smooth team collaboration.