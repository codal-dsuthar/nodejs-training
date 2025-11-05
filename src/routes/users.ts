import { FastifyInstance } from 'fastify';

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
        security: [{ Authorization: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    username: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string' }
                  }
                }
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' }
            }
          }
        }
      }
    },
    async (_request, _reply) => {
      // TODO: Implement actual user listing with pagination
      return {
        users: [
          {
            id: 'placeholder-user-1',
            email: 'user1@example.com',
            username: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      };
    }
  );

  app.get(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID',
        security: [{ Authorization: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' }
          },
          required: ['id']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request, _reply) => {
      const { id } = request.params as { id: string };

      // TODO: Implement actual user retrieval
      return {
        user: {
          id,
          email: 'user@example.com',
          username: 'user',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  );

  app.patch(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Update user information',
        security: [{ Authorization: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            username: { type: 'string', minLength: 3, maxLength: 30 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isActive: { type: 'boolean' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    async (request, _reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;

      // TODO: Implement actual user update
      return {
        message: 'User updated successfully',
        user: {
          id,
          ...body
        }
      };
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Delete a user account',
        security: [{ Authorization: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' }
          },
          required: ['id']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, _reply) => {
      const { id } = request.params as { id: string };

      // TODO: Implement actual user deletion
      return {
        message: 'User deleted successfully',
        id
      };
    }
  );
}
