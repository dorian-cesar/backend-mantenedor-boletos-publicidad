const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const upload = require('../config/multer');

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
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         url:
 *           type: string
 *         empresa_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: boolean
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
router.get('/', videoController.getAll);

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
 *               empresa_id:
 *                 type: string
 *                 format: uuid
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Video subido con éxito
 */
router.post('/', upload.single('video'), videoController.create);

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
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Video eliminado
 */
router.delete('/:id', videoController.delete);

module.exports = router;
