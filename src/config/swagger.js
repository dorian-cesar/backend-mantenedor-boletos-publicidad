const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Mantenedor de Boletos y Publicidad',
            version: '1.0.0',
            description: 'Documentación de la API para la gestión de Totems, Videos y Empresas.',
        },
        servers: [
            {
                url: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
                description: 'Servidor de la API',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'API Key para acceso global a los endpoints'
                }
            },
        },
        security: [
            {
                apiKeyAuth: []
            },
            {
                bearerAuth: []
            }
        ],
    },
    apis: ['./src/routes/*.js'], // Ruta a los archivos con anotaciones
};

const specs = swaggerJsDoc(options);

module.exports = specs;
