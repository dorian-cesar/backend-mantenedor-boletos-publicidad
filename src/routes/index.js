const express = require('express');
const router = express.Router();

const empresaRoutes = require('./empresa.routes');
const videoRoutes = require('./video.routes');
const videoUploadRoutes = require('./videoUpload.routes');
const totemRoutes = require('./totem.routes');
const authRoutes = require('./auth.routes');
const apiKeyRoutes = require('./apiKey.routes');
const ventaBoletoRoutes = require('./ventaBoleto.routes');
const interaccionTotemRoutes = require('./interaccionTotem.routes');

// IMPORTANTE: /videos/upload debe ir ANTES de /videos para que Express matchee correctamente
router.use('/videos/upload', videoUploadRoutes);
router.use('/videos', videoRoutes);
router.use('/empresas', empresaRoutes);
router.use('/totems', totemRoutes);
router.use('/auth', authRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/ventas', ventaBoletoRoutes);
router.use('/interacciones', interaccionTotemRoutes);

module.exports = router;
