const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded videos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Swagger Documentation (Opcional según variable de entorno)
if (process.env.SWAGGER_ENABLED === 'true') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./config/swagger');
    
    // UI de Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    // JSON de Swagger para importar en Postman
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    
    console.log('Swagger docs available at http://localhost:3000/api-docs');
    console.log('Swagger JSON available at http://localhost:3000/api-docs.json');
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

module.exports = app;
