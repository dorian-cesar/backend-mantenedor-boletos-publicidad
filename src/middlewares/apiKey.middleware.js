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

    // Buscamos la llave en la base de datos e incluimos el tótem si aplica
    const { Totem } = require('../models');
    const keyFound = await ApiKey.findOne({ 
        where: { key: apiKeyHeader, status: true },
        include: [{ model: Totem, as: 'totem' }]
    });

    if (!keyFound) {
        return res.status(403).json({
            message: 'Acceso denegado: API Key inválida o inactiva'
        });
    }

    // Si es una llave de tipo TOTEM, guardamos la info en req.user para compatibilidad
    if (keyFound.tipo === 'TOTEM' && keyFound.totem) {
        req.user = {
            id: keyFound.totem.id,
            identificador: keyFound.totem.identificador,
            rol: 'TOTEM',
            via: 'api-key'
        };
    } else if (keyFound.tipo === 'PLATAFORMA') {
        // Si es una llave de PLATAFORMA, le damos rol ADMIN para acceso total
        req.user = {
            rol: 'ADMIN',
            via: 'api-key'
        };
    }

    next();
};

module.exports = apiKeyMiddleware;
