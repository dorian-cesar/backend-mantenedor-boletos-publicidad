const express = require('express');
const router = express.Router();
const logOperacionController = require('../controllers/logOperacion.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Endpoint público/privado para que el Frontend guarde el log (Podría requerir auth si se desea, pero usualmente el usuario que solicita está autenticado o es un totem)
router.post('/', logOperacionController.createLog);

// Endpoint protegido exclusivo para ADMIN
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), logOperacionController.getAllLogs);

module.exports = router;
