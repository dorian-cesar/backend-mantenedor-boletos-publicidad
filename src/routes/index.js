const express = require('express');
const router = express.Router();

const empresaRoutes = require('./empresa.routes');
const videoRoutes = require('./video.routes');
const totemRoutes = require('./totem.routes');
const authRoutes = require('./auth.routes');

router.use('/empresas', empresaRoutes);
router.use('/videos', videoRoutes);
router.use('/totems', totemRoutes);
router.use('/auth', authRoutes);

module.exports = router;
