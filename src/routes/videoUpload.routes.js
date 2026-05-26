const express = require('express');
const router = express.Router();
const videoUploadController = require('../controllers/videoUpload.controller');
const uploadChunk = require('../config/multerChunk');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadSession:
 *       type: object
 *       properties:
 *         upload_id:
 *           type: string
 *           format: uuid
 *         chunk_size:
 *           type: integer
 *           description: Tamaño de cada chunk en bytes
 *         total_chunks:
 *           type: integer
 *         expires_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Video Upload (Chunked)
 *   description: API para subida de videos por chunks con reanudación. Diseñado para redes móviles inestables.
 */

/**
 * @swagger
 * /api/videos/upload/init:
 *   post:
 *     summary: Inicializa una sesión de upload chunked
 *     description: |
 *       Crea una nueva sesión de upload. El servidor calcula cuántos chunks se necesitan
 *       y devuelve un `upload_id` que el cliente usará para enviar cada chunk.
 *     tags: [Video Upload (Chunked)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *               - total_size
 *               - empresa_id
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Nombre original del archivo (con extensión)
 *                 example: "video_publicidad.mp4"
 *               total_size:
 *                 type: integer
 *                 description: Tamaño total del archivo en bytes
 *                 example: 52428800
 *               empresa_id:
 *                 type: integer
 *                 description: ID de la empresa
 *                 example: 1
 *               nombre:
 *                 type: string
 *                 description: Nombre descriptivo para el video
 *               descripcion:
 *                 type: string
 *                 description: Descripción del video
 *     responses:
 *       201:
 *         description: Sesión de upload creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upload_id:
 *                   type: string
 *                   format: uuid
 *                 chunk_size:
 *                   type: integer
 *                 total_chunks:
 *                   type: integer
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos faltantes o formato no soportado
 *       404:
 *         description: Empresa no encontrada
 */
router.post('/init',
    authMiddleware,
    roleMiddleware(['ADMIN', 'USER']),
    videoUploadController.initUpload
);

/**
 * @swagger
 * /api/videos/upload/{uploadId}/chunk/{index}:
 *   put:
 *     summary: Envía un chunk individual
 *     description: |
 *       Envía un fragmento (chunk) del archivo. Los chunks son idempotentes:
 *       si se reenvía un chunk ya recibido, responde 200 sin error.
 *       El campo del archivo en el form-data debe llamarse "chunk".
 *     tags: [Video Upload (Chunked)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la sesión de upload
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Índice del chunk (0-based)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               chunk:
 *                 type: string
 *                 format: binary
 *                 description: Datos binarios del chunk
 *     responses:
 *       200:
 *         description: Chunk recibido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 received_chunks:
 *                   type: integer
 *                 total_chunks:
 *                   type: integer
 *                 progress:
 *                   type: integer
 *                   description: Porcentaje de progreso (0-100)
 *       400:
 *         description: Índice inválido o chunk no recibido
 *       404:
 *         description: Sesión de upload no encontrada
 *       409:
 *         description: Sesión en estado incompatible
 *       410:
 *         description: Sesión expirada
 */
router.put('/:uploadId/chunk/:index',
    authMiddleware,
    roleMiddleware(['ADMIN', 'USER']),
    uploadChunk.single('chunk'),
    videoUploadController.uploadChunk
);

/**
 * @swagger
 * /api/videos/upload/{uploadId}/status:
 *   get:
 *     summary: Consulta el estado de un upload
 *     description: |
 *       Devuelve el estado actual del upload incluyendo qué chunks ya se recibieron
 *       y cuáles faltan. Útil para reanudar después de una desconexión.
 *     tags: [Video Upload (Chunked)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estado actual del upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upload_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, uploading, assembling, completed, failed, expired]
 *                 received_chunks:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 missing_chunks:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 progress:
 *                   type: integer
 *       404:
 *         description: Sesión no encontrada
 */
router.get('/:uploadId/status',
    authMiddleware,
    roleMiddleware(['ADMIN', 'USER']),
    videoUploadController.getStatus
);

/**
 * @swagger
 * /api/videos/upload/{uploadId}/complete:
 *   post:
 *     summary: Completa el upload y ensambla el video
 *     description: |
 *       Una vez enviados todos los chunks, llama a este endpoint para ensamblar
 *       el archivo final y crear el registro de Video en la base de datos.
 *       Si el archivo es un ZIP, se descomprime automáticamente.
 *     tags: [Video Upload (Chunked)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Video ensamblado y creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 video:
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Faltan chunks por recibir
 *       404:
 *         description: Sesión no encontrada
 *       409:
 *         description: Estado incompatible (ya completado o fallido)
 */
router.post('/:uploadId/complete',
    authMiddleware,
    roleMiddleware(['ADMIN', 'USER']),
    videoUploadController.completeUpload
);

/**
 * @swagger
 * /api/videos/upload/{uploadId}:
 *   delete:
 *     summary: Aborta un upload en progreso
 *     description: Cancela la sesión de upload, elimina los chunks del disco y marca la sesión como fallida.
 *     tags: [Video Upload (Chunked)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Upload abortado y recursos limpiados
 *       404:
 *         description: Sesión no encontrada
 *       409:
 *         description: No se puede abortar un upload ya completado
 */
router.delete('/:uploadId',
    authMiddleware,
    roleMiddleware(['ADMIN', 'USER']),
    videoUploadController.abortUpload
);

module.exports = router;
