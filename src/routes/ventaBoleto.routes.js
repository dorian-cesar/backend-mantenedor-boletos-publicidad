const express = require('express');
const router = express.Router();
const ventaBoletoController = require('../controllers/ventaBoleto.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     VentaBoleto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         totem_id:
 *           type: integer
 *         payload_request:
 *           type: object
 *         payload_response:
 *           type: object
 *         ticket_numbers:
 *           type: array
 *           items:
 *             type: string
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *         operation:
 *           type: string
 *         provider:
 *           type: string
 *         timestamp_operacion:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: API para el registro y auditoría de ventas de boletos
 */

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Registra una nueva venta de boleto (Tótem/Admin)
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payload_request
 *               - payload_response
 *             properties:
 *               totem_id:
 *                 type: integer
 *                 description: Solo requerido si quien registra es un ADMIN. Si es un TOTEM, se toma de su token.
 *               payload_request:
 *                 type: object
 *                 example: {"company":"EPA","serviceId":"77228","totalAmount":90600}
 *               payload_response:
 *                 type: object
 *                 example: {"success":true,"status":"success","data":{"ticketNumbers":["70030020000116"]}}
 *     responses:
 *       201:
 *         description: Venta registrada exitosamente
 *       400:
 *         description: Datos faltantes o inválidos
 */
router.post('/', 
    authMiddleware, 
    roleMiddleware(['TOTEM', 'ADMIN']), 
    ventaBoletoController.registrarVenta
);

/**
 * @swagger
 * /api/ventas/auditoria:
 *   get:
 *     summary: Obtiene el reporte de auditoría de ventas (Solo Admin)
 *     tags: [Ventas]
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
 *         description: Reporte de auditoría y lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_ventas:
 *                       type: integer
 *                     monto_total:
 *                       type: number
 *                     exitosas:
 *                       type: integer
 *                     fallidas:
 *                       type: integer
 *                 ventas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VentaBoleto'
 */
router.get('/auditoria', 
    authMiddleware, 
    roleMiddleware(['ADMIN']), 
    ventaBoletoController.getAuditoria
);

module.exports = router;
