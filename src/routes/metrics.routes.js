const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metrics.controller');
const { ApiKey } = require('../models');

// 1. Autenticación: Implementa un middleware sencillo que valide un token 
// en los headers usando x-api-key. Si no es válido, retorna 401 Unauthorized.
const simpleApiKeyAuth = async (req, res, next) => {
    const apiKeyHeader = req.headers['x-api-key'];
    
    if (!apiKeyHeader) {
        return res.status(401).json({ message: 'Unauthorized: Missing x-api-key' });
    }

    try {
        const keyFound = await ApiKey.findOne({ 
            where: { key: apiKeyHeader, status: true }
        });

        if (!keyFound) {
            return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
        }

        // Adjuntar contexto de seguridad al request
        req.user = {
            id: keyFound.totem_id || null,
            tipo: keyFound.tipo
        };

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error validating API Key' });
    }
};

// Endpoint para recibir métricas (POST /api/v1/totems/metrics)
router.post('/', simpleApiKeyAuth, metricsController.receiveMetrics);

// Endpoint para que el Mantenedor consulte las métricas (GET /api/v1/totems/metrics)
// Asumimos que los admins tendrán un token JWT válido que pasará el authMiddleware global
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.get('/', [authMiddleware, roleMiddleware(['ADMIN'])], metricsController.getAllMetrics);

module.exports = router;
