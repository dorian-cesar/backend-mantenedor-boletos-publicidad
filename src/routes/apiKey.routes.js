const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKey.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: ApiKeys
 *   description: Gestión de API Keys para el sistema
 */

/**
 * @swagger
 * /api/api-keys:
 *   post:
 *     summary: Genera una nueva API Key (Solo Admin)
 *     tags: [ApiKeys]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [PLATAFORMA, TOTEM]
 *               totem_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: API Key generada
 */
router.post('/', [authMiddleware, roleMiddleware(['ADMIN'])], apiKeyController.create);

/**
 * @swagger
 * /api/api-keys:
 *   get:
 *     summary: Lista todas las API Keys (Solo Admin)
 *     tags: [ApiKeys]
 *     responses:
 *       200:
 *         description: Lista de llaves
 */
router.get('/', [authMiddleware, roleMiddleware(['ADMIN'])], apiKeyController.getAll);

/**
 * @swagger
 * /api/api-keys/{id}:
 *   patch:
 *     summary: Actualiza parcialmente una API Key (Solo Admin)
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               status:
 *                 type: boolean
 *               tipo:
 *                 type: string
 *                 enum: [PLATAFORMA, TOTEM]
 *               totem_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: API Key actualizada
 */
router.patch('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], apiKeyController.update);

/**
 * @swagger
 * /api/api-keys/{id}:
 *   delete:
 *     summary: Elimina una API Key (Solo Admin)
 *     tags: [ApiKeys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API Key eliminada
 */
router.delete('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], apiKeyController.delete);

module.exports = router;
