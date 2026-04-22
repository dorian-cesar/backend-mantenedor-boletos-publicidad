const express = require('express');
const router = express.Router();
const totemController = require('../controllers/totem.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');


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
 *           type: integer
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
router.get('/', authMiddleware, totemController.getAll);

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
 *                   type: integer
 *     responses:
 *       201:
 *         description: Totem creado
 */
router.post('/', [authMiddleware, roleMiddleware(['ADMIN'])], totemController.create);

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
 *           type: integer
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
 *                   type: integer
 *     responses:
 *       200:
 *         description: Totem actualizado
 */
router.put('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], totemController.update);

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
 *           type: integer
 *     responses:
 *       200:
 *         description: Totem eliminado
 */
router.delete('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], totemController.delete);

module.exports = router;
