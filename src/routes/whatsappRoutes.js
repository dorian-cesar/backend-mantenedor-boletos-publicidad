const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Ruta para que Meta verifique el Webhook
router.get('/webhook', whatsappController.verifyWebhook);

// Ruta para recibir los mensajes de los usuarios
router.post('/webhook', whatsappController.receiveMessage);

module.exports = router;
