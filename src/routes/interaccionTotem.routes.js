const express = require('express');
const router = express.Router();
const interaccionTotemController = require('../controllers/interaccionTotem.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     InteraccionTotem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         totem_id:
 *           type: integer
 *         exitosa:
 *           type: boolean
 *         paso_alcanzado:
 *           type: string
 *           description: "Último paso alcanzado (ej: inicio, seleccion_servicio, seleccion_numeros, pago, impresion, completado)"
 *         pasos_completados:
 *           type: array
 *           items:
 *             type: string
 *           description: "Lista ordenada de pasos completados"
 *         motivo_fallo:
 *           type: string
 *           description: "Razón del fallo (solo en interacciones fallidas)"
 *         duracion_segundos:
 *           type: integer
 *         metadata:
 *           type: object
 */

/**
 * @swagger
 * tags:
 *   name: Interacciones
 *   description: API para el registro y consulta de interacciones de usuarios en los totems
 */

/**
 * @swagger
 * /api/interacciones:
 *   post:
 *     summary: Registra una nueva interacción en un totem (Tótem/Admin)
 *     tags: [Interacciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exitosa
 *             properties:
 *               totem_id:
 *                 type: integer
 *                 description: Solo requerido si quien registra es un ADMIN. Si es un TOTEM, se toma de su token.
 *               exitosa:
 *                 type: boolean
 *                 description: Indica si la interacción fue exitosa
 *               paso_alcanzado:
 *                 type: string
 *                 description: "Último paso alcanzado (ej: inicio, seleccion_servicio, seleccion_numeros, pago, impresion)"
 *               pasos_completados:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Lista de pasos completados en orden"
 *                 example: ["inicio", "seleccion_servicio", "seleccion_numeros"]
 *               motivo_fallo:
 *                 type: string
 *                 description: "Razón del fallo (solo si exitosa = false)"
 *                 example: "Timeout en pasarela de pago"
 *               duracion_segundos:
 *                 type: integer
 *                 description: "Duración de la interacción en segundos"
 *                 example: 45
 *               metadata:
 *                 type: object
 *                 description: "Datos adicionales"
 *     responses:
 *       201:
 *         description: Interacción registrada exitosamente
 *       400:
 *         description: Datos faltantes o inválidos
 */
router.post('/',
    authMiddleware,
    roleMiddleware(['TOTEM', 'ADMIN']),
    interaccionTotemController.registrar
);

/**
 * @swagger
 * /api/interacciones/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas de interacciones (Solo Admin)
 *     tags: [Interacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: totem_id
 *         schema:
 *           type: integer
 *         description: Filtrar por un tótem específico
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estadísticas de interacciones con desglose por paso y por totem
 */
router.get('/estadisticas',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    interaccionTotemController.getEstadisticas
);

/**
 * @swagger
 * /api/interacciones/historial:
 *   get:
 *     summary: Obtiene el historial detallado de interacciones (Solo Admin)
 *     tags: [Interacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: totem_id
 *         schema:
 *           type: integer
 *         description: Filtrar por un tótem específico
 *       - in: query
 *         name: exitosa
 *         schema:
 *           type: boolean
 *         description: Filtrar por interacciones exitosas (true) o fallidas (false)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Historial paginado de interacciones
 */
router.get('/historial',
    authMiddleware,
    roleMiddleware(['ADMIN']),
    interaccionTotemController.getHistorial
);

module.exports = router;
