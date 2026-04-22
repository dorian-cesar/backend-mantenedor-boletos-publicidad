const { ApiKey } = require('../models');

/**
 * Middleware para validar el API Key en todas las peticiones
 */
const apiKeyMiddleware = async (req, res, next) => {
    // Si la ruta es la de documentación, la dejamos pasar
    if (req.path.startsWith('/api-docs')) {
        return next();
    }

    const apiKeyHeader = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKeyHeader) {
        return res.status(403).json({
            message: 'Acceso denegado: API Key no proporcionada'
        });
    }

    // Buscamos la llave en la base de datos
    const keyFound = await ApiKey.findOne({ where: { key: apiKeyHeader, status: true } });

    if (!keyFound) {
        return res.status(403).json({
            message: 'Acceso denegado: API Key inválida o inactiva'
        });
    }

    next();
};

module.exports = apiKeyMiddleware;
