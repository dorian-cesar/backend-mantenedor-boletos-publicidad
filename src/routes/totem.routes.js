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
 *         latitud:
 *           type: number
 *           format: float
 *         longitud:
 *           type: number
 *           format: float
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
 * /api/totems/login:
 *   post:
 *     summary: Autentica un totem para obtener un token de acceso
 *     tags: [Totems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - apiKey
 *             properties:
 *               id:
 *                 type: integer
 *               apiKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve un JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 totem:
 *                   $ref: '#/components/schemas/Totem'
 */
router.post('/login', totemController.loginTotem);

/**
 * @swagger
 * /api/totems/{id}:
 *   get:
 *     summary: Obtiene un totem por ID
 *     tags: [Totems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles del totem
 */
router.get('/:id', authMiddleware, totemController.getById);

/**
 * @swagger
 * /api/totems/{id}/playlist:
 *   get:
 *     summary: Obtiene la lista de videos ordenada para el totem (Playlist)
 *     tags: [Totems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playlist del totem
 */
router.get('/:id/playlist', authMiddleware, totemController.getPlaylist);

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
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
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
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
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
 *   patch:
 *     summary: Actualiza parcialmente un totem
 *     tags: [Totems]
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
 *               identificador:
 *                 type: string
 *               direccion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               video_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Totem actualizado parcialmente
 */
router.patch('/:id', [authMiddleware, roleMiddleware(['ADMIN'])], totemController.patch);

/**
 * @swagger
 * /api/totems/{id}/coordinates:
 *   patch:
 *     summary: Actualiza las coordenadas de un totem
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
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *     responses:
 *       200:
 *         description: Coordenadas actualizadas
 */
router.patch('/:id/coordinates', authMiddleware, totemController.updateCoordinates);

/**
 * @swagger
 * /api/totems/{id}/videos:
 *   post:
 *     summary: Agrega uno o más videos al tótem
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
 *             required:
 *               - video_ids
 *             properties:
 *               video_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Videos agregados correctamente
 */
router.post('/:id/videos', [authMiddleware, roleMiddleware(['ADMIN'])], totemController.addVideos);

/**
 * @swagger
 * /api/totems/{id}/videos/{videoId}:
 *   delete:
 *     summary: Remueve un video específico del tótem
 *     tags: [Totems]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Video removido correctamente
 */
router.delete('/:id/videos/:videoId', [authMiddleware, roleMiddleware(['ADMIN'])], totemController.removeVideo);

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
