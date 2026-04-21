const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresa.controller');

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
 *           type: string
 *           format: uuid
 *           description: ID autogenerado de la empresa
 *         nombre:
 *           type: string
 *           description: Nombre de la empresa
 *         status:
 *           type: boolean
 *           description: Estado de la empresa (activo/inactivo)
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         nombre: Pullman Bus
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
router.get('/', empresaController.getAll);

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
 *           type: string
 *           format: uuid
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
router.get('/:id', empresaController.getById);

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
router.post('/', empresaController.create);

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
 *           type: string
 *           format: uuid
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
router.put('/:id', empresaController.update);

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
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Empresa eliminada
 *       404:
 *         description: Empresa no encontrada
 */
router.delete('/:id', empresaController.delete);

module.exports = router;
