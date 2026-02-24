const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IOT Attendance API',
            version: '1.0.0',
            description: 'API documentation for IOT Service'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js'] // path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;