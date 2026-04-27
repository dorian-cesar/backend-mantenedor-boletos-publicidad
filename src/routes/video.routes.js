const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const upload = require('../config/multer');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');


/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       required:
 *         - url
 *         - empresa_id
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         url:
 *           type: string
 *         empresa_id:
 *           type: integer
 *         status:
 *           type: boolean
 *         orden:
 *           type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: API para la gestión de videos
 */

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Obtiene todos los videos
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Lista de videos
 */
router.get('/', authMiddleware, videoController.getAll);
/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Obtiene un video por ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del video
 */
router.get('/:id', authMiddleware, videoController.getById);

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Sube un nuevo video o archivo comprimido
 *     tags: [Videos]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               empresa_id:
 *                 type: integer
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Video subido con éxito
 */
router.post('/', [authMiddleware, roleMiddleware(['ADMIN', 'USER']), upload.single('video')], videoController.create);

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Actualiza un video existente
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               empresa_id:
 *                 type: integer
 *               status:
 *                 type: boolean
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video actualizado con éxito
 */
router.put('/:id', [authMiddleware, roleMiddleware(['ADMIN', 'USER']), upload.single('video')], videoController.update);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Elimina un video (soft delete)
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Video eliminado
 */
router.delete('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], videoController.delete);

/**
 * @swagger
 * /api/videos/reorder:
 *   post:
 *     summary: Actualiza el orden de múltiples videos
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orden:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Orden actualizado con éxito
 */
router.post('/reorder', authMiddleware, videoController.bulkUpdateOrder);

module.exports = router;
