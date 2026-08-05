const express = require('express');
const router = express.Router();
const devolucionController = require('../controllers/devolucion.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Crear devolución (puede ser desde un Tótem autenticado o un usuario Web)
router.post('/', authMiddleware, devolucionController.create);

// Obtener devoluciones (solo FINANZAS o ADMIN)
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'FINANZAS']), devolucionController.getAll);

// Actualizar estado (solo FINANZAS o ADMIN)
router.patch('/:id/estado', authMiddleware, roleMiddleware(['ADMIN', 'FINANZAS']), devolucionController.updateStatus);

module.exports = router;
