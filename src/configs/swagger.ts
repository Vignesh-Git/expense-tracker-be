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
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 