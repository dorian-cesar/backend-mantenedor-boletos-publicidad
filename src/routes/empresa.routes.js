const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresa.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Empresa:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la empresa
 *         nombre:
 *           type: string
 *           description: Nombre de la empresa
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la empresa
 *         status:
 *           type: boolean
 *           description: Estado de la empresa (activo/inactivo)
 *       example:
 *         id: 1
 *         nombre: Pullman Bus
 *         descripcion: Empresa de transporte interurbano líder en Chile.
 *         status: true
 */

/**
 * @swagger
 * tags:
 *   name: Empresas
 *   description: API para la gestión de empresas
 */

/**
 * @swagger
 * /api/empresas:
 *   get:
 *     summary: Obtiene todas las empresas
 *     tags: [Empresas]
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empresa'
 */
router.get('/', authMiddleware, empresaController.getAll);

/**
 * @swagger
 * /api/empresas/{id}:
 *   get:
 *     summary: Obtiene una empresa por ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa no encontrada
 */
router.get('/:id', authMiddleware, empresaController.getById);

/**
 * @swagger
 * /api/empresas:
 *   post:
 *     summary: Crea una nueva empresa
 *     tags: [Empresas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empresa'
 *     responses:
 *       201:
 *         description: Empresa creada
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', [authMiddleware, roleMiddleware(['ADMIN'])], empresaController.create);

/**
 * @swagger
 * /api/empresas/{id}:
 *   put:
 *     summary: Actualiza una empresa
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empresa'
 *     responses:
 *       200:
 *         description: Empresa actualizada
 *       404:
 *         description: Empresa no encontrada
 */
router.put('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], empresaController.update);

/**
 * @swagger
 * /api/empresas/{id}:
 *   delete:
 *     summary: Elimina una empresa (soft delete)
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empresa eliminada
 *       404:
 *         description: Empresa no encontrada
 */
router.delete('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], empresaController.delete);

/**
 * @swagger
 * /api/empresas/{id}/videos:
 *   get:
 *     summary: Obtiene los videos asociados a una o varias empresas (ID y Nombre)
 *     description: "Permite enviar uno o varios IDs de empresa separados por comas (ej: 1 o 1,2,3)"
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID o lista de IDs de empresa (separados por coma)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Cantidad máxima de videos a retornar (aleatorios)
 *     responses:
 *       200:
 *         description: Lista de videos de las empresas solicitadas con el conteo total
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Cantidad total de videos encontrados
 *                 videos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       empresa_id:
 *                         type: integer
 */
router.get('/:id/videos', authMiddleware, empresaController.getVideosByEmpresa);

module.exports = router;
