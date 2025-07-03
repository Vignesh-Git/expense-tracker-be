import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ExpenSync API',
      version: '1.0.0',
      description: 'API documentation for ExpenSync authentication and user management',
    },
    servers: [
      { url: 'http://localhost:5000' },
    ],
    components: {
      schemas: {
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { 
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' }
              }
            },
            type: { 
              type: 'string', 
              enum: ['category', 'expense'] 
            },
            status: { 
              type: 'string', 
              enum: ['requested', 'approved', 'denied'] 
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sender: { 
                    type: 'string', 
                    enum: ['user', 'admin'] 
                  },
                  message: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
      }
    }
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 