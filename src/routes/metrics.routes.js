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
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error validating API Key' });
    }
};

// Endpoint: POST /api/v1/totems/metrics (el prefijo se configura en el index.js de rutas)
router.post('/', simpleApiKeyAuth, metricsController.receiveMetrics);

module.exports = router;
