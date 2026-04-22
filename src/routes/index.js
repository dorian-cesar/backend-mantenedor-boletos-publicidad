const express = require('express');
const router = express.Router();

const empresaRoutes = require('./empresa.routes');
const videoRoutes = require('./video.routes');
const totemRoutes = require('./totem.routes');
const authRoutes = require('./auth.routes');
const apiKeyRoutes = require('./apiKey.routes');

router.use('/empresas', empresaRoutes);
router.use('/videos', videoRoutes);
router.use('/totems', totemRoutes);
router.use('/auth', authRoutes);
router.use('/api-keys', apiKeyRoutes);

module.exports = router;
