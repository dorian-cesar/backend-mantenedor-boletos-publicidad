const express = require('express');
const router = express.Router();
const totemController = require('../controllers/totem.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Totem:
 *       type: object
 *       required:
 *         - identificador
 *         - direccion
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         identificador:
 *           type: string
 *         direccion:
 *           type: string
 *         status:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Totems
 *   description: API para la gestión de totems
 */

/**
 * @swagger
 * /api/totems:
 *   get:
 *     summary: Obtiene todos los totems
 *     tags: [Totems]
 *     responses:
 *       200:
 *         description: Lista de totems
 */
router.get('/', totemController.getAll);

/**
 * @swagger
 * /api/totems:
 *   post:
 *     summary: Crea un nuevo totem
 *     tags: [Totems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identificador:
 *                 type: string
 *               direccion:
 *                 type: string
 *               video_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Totem creado
 */
router.post('/', totemController.create);

/**
 * @swagger
 * /api/totems/{id}:
 *   put:
 *     summary: Actualiza un totem
 *     tags: [Totems]
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
 *             type: object
 *             properties:
 *               identificador:
 *                 type: string
 *               direccion:
 *                 type: string
 *               video_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Totem actualizado
 */
router.put('/:id', totemController.update);

/**
 * @swagger
 * /api/totems/{id}:
 *   delete:
 *     summary: Elimina un totem (soft delete)
 *     tags: [Totems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Totem eliminado
 */
router.delete('/:id', totemController.delete);

module.exports = router;
