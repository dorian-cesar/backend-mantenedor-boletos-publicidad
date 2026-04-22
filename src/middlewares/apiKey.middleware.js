/**
 * Middleware para validar el API Key en todas las peticiones
 */
const apiKeyMiddleware = (req, res, next) => {
    // Si la ruta es la de documentación, la dejamos pasar
    if (req.path.startsWith('/api-docs')) {
        return next();
    }

    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(403).json({
            message: 'Acceso denegado: API Key inválida o no proporcionada'
        });
    }

    next();
};

module.exports = apiKeyMiddleware;
