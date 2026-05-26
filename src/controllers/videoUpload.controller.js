const { Video, Empresa } = require('../models');
const UploadSession = require('../models/UploadSession');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE) || (2 * 1024 * 1024); // 2MB default
const UPLOAD_EXPIRY_HOURS = parseInt(process.env.UPLOAD_EXPIRY_HOURS) || 24;

/**
 * POST /api/videos/upload/init
 * Inicializa una sesión de upload chunked
 */
exports.initUpload = async (req, res) => {
    try {
        const { filename, total_size, empresa_id, nombre, descripcion } = req.body;

        // Validaciones
        if (!filename || !total_size || !empresa_id) {
            return res.status(400).json({
                message: 'Se requieren: filename, total_size, empresa_id'
            });
        }

        // Validar extensión
        const ext = path.extname(filename).toLowerCase();
        const allowedExtensions = ['.mp4', '.zip', '.rar'];
        if (!allowedExtensions.includes(ext)) {
            return res.status(400).json({
                message: `Formato no soportado. Solo: ${allowedExtensions.join(', ')}`
            });
        }

        // Validar que la empresa existe
        const empresa = await Empresa.findByPk(empresa_id);
        if (!empresa) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }

        // Validar tamaño máximo (100MB por defecto, configurable)
        const maxSize = parseInt(process.env.MAX_UPLOAD_SIZE) || (100 * 1024 * 1024);
        if (total_size > maxSize) {
            return res.status(400).json({
                message: `El archivo excede el tamaño máximo permitido (${Math.round(maxSize / 1024 / 1024)}MB)`
            });
        }

        // Calcular chunks
        const totalChunks = Math.ceil(total_size / CHUNK_SIZE);

        // Fecha de expiración
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + UPLOAD_EXPIRY_HOURS);

        // Crear sesión
        const session = await UploadSession.create({
            original_filename: filename,
            total_size,
            chunk_size: CHUNK_SIZE,
            total_chunks: totalChunks,
            received_chunks: [],
            status: 'pending',
            empresa_id,
            nombre: nombre || path.parse(filename).name,
            descripcion: descripcion || null,
            usuario_id: req.user?.id || null,
            expires_at: expiresAt
        });

        // Crear directorio de chunks
        const chunkDir = path.join(__dirname, '../../uploads/chunks', session.id);
        fs.mkdirSync(chunkDir, { recursive: true });

        res.status(201).json({
            upload_id: session.id,
            chunk_size: CHUNK_SIZE,
            total_chunks: totalChunks,
            expires_at: expiresAt,
            message: `Sesión de upload creada. Envía ${totalChunks} chunks de ${Math.round(CHUNK_SIZE / 1024)}KB cada uno.`
        });
    } catch (error) {
        console.error('[VideoUpload] Error en initUpload:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/videos/upload/:uploadId/chunk/:index
 * Recibe un chunk individual
 */
exports.uploadChunk = async (req, res) => {
    try {
        const { uploadId, index } = req.params;
        const chunkIndex = parseInt(index);

        // Buscar sesión
        const session = await UploadSession.findByPk(uploadId);
        if (!session) {
            return res.status(404).json({ message: 'Sesión de upload no encontrada' });
        }

        // Validar que no esté expirada
        if (new Date() > new Date(session.expires_at)) {
            await session.update({ status: 'expired' });
            return res.status(410).json({ message: 'La sesión de upload ha expirado' });
        }

        // Validar estado
        if (!['pending', 'uploading'].includes(session.status)) {
            return res.status(409).json({
                message: `La sesión está en estado '${session.status}', no se pueden recibir más chunks`
            });
        }

        // Validar índice
        if (isNaN(chunkIndex) || chunkIndex < 0 || chunkIndex >= session.total_chunks) {
            return res.status(400).json({
                message: `Índice de chunk inválido. Rango válido: 0-${session.total_chunks - 1}`
            });
        }

        // Verificar si ya se recibió (idempotencia)
        const receivedChunks = session.received_chunks || [];
        if (receivedChunks.includes(chunkIndex)) {
            return res.status(200).json({
                message: `Chunk ${chunkIndex} ya fue recibido anteriormente`,
                already_received: true,
                received_chunks: receivedChunks.length,
                total_chunks: session.total_chunks
            });
        }

        // Verificar que el archivo del chunk fue guardado por Multer
        if (!req.file) {
            return res.status(400).json({ message: 'No se recibió el chunk' });
        }

        // Actualizar sesión
        const updatedChunks = [...receivedChunks, chunkIndex].sort((a, b) => a - b);
        const newStatus = updatedChunks.length === session.total_chunks ? 'uploading' : 
                          session.status === 'pending' ? 'uploading' : session.status;

        await session.update({
            received_chunks: updatedChunks,
            status: newStatus
        });

        res.status(200).json({
            message: `Chunk ${chunkIndex} recibido correctamente`,
            received_chunks: updatedChunks.length,
            total_chunks: session.total_chunks,
            progress: Math.round((updatedChunks.length / session.total_chunks) * 100)
        });
    } catch (error) {
        console.error('[VideoUpload] Error en uploadChunk:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/videos/upload/:uploadId/status
 * Consulta el estado actual de un upload
 */
exports.getStatus = async (req, res) => {
    try {
        const { uploadId } = req.params;

        const session = await UploadSession.findByPk(uploadId);
        if (!session) {
            return res.status(404).json({ message: 'Sesión de upload no encontrada' });
        }

        const receivedChunks = session.received_chunks || [];
        const missingChunks = [];
        for (let i = 0; i < session.total_chunks; i++) {
            if (!receivedChunks.includes(i)) {
                missingChunks.push(i);
            }
        }

        res.json({
            upload_id: session.id,
            status: session.status,
            original_filename: session.original_filename,
            total_size: session.total_size,
            chunk_size: session.chunk_size,
            total_chunks: session.total_chunks,
            received_chunks: receivedChunks,
            missing_chunks: missingChunks,
            progress: Math.round((receivedChunks.length / session.total_chunks) * 100),
            expires_at: session.expires_at,
            video_id: session.video_id,
            created_at: session.createdAt
        });
    } catch (error) {
        console.error('[VideoUpload] Error en getStatus:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/videos/upload/:uploadId/complete
 * Ensambla los chunks y crea el Video en BD
 */
exports.completeUpload = async (req, res) => {
    try {
        const { uploadId } = req.params;

        const session = await UploadSession.findByPk(uploadId);
        if (!session) {
            return res.status(404).json({ message: 'Sesión de upload no encontrada' });
        }

        // Validar estado
        if (session.status === 'completed') {
            return res.status(200).json({
                message: 'Este upload ya fue completado',
                video_id: session.video_id
            });
        }

        if (!['pending', 'uploading'].includes(session.status)) {
            return res.status(409).json({
                message: `No se puede completar un upload en estado '${session.status}'`
            });
        }

        // Validar que todos los chunks estén
        const receivedChunks = session.received_chunks || [];
        if (receivedChunks.length !== session.total_chunks) {
            const missingChunks = [];
            for (let i = 0; i < session.total_chunks; i++) {
                if (!receivedChunks.includes(i)) missingChunks.push(i);
            }
            return res.status(400).json({
                message: `Faltan ${missingChunks.length} chunks por recibir`,
                missing_chunks: missingChunks,
                received: receivedChunks.length,
                total: session.total_chunks
            });
        }

        // Marcar como ensamblando
        await session.update({ status: 'assembling' });

        const chunkDir = path.join(__dirname, '../../uploads/chunks', session.id);
        const ext = path.extname(session.original_filename).toLowerCase();
        const finalFilename = `${uuidv4()}${ext}`;
        const finalPath = path.join(__dirname, '../../uploads', finalFilename);

        try {
            // Ensamblar archivo
            const writeStream = fs.createWriteStream(finalPath);

            for (let i = 0; i < session.total_chunks; i++) {
                const chunkPath = path.join(chunkDir, `${i}.part`);

                if (!fs.existsSync(chunkPath)) {
                    throw new Error(`Chunk ${i} no encontrado en disco`);
                }

                const chunkData = fs.readFileSync(chunkPath);
                writeStream.write(chunkData);
            }

            // Esperar a que termine de escribir
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                writeStream.end();
            });

            // Verificar tamaño del archivo final
            const stats = fs.statSync(finalPath);
            console.log(`[VideoUpload] Archivo ensamblado: ${finalPath} (${stats.size} bytes)`);

            let videoUrl = `/uploads/${finalFilename}`;

            // Lógica de descompresión si es ZIP (misma que video.controller.js)
            if (ext === '.zip') {
                const zip = new AdmZip(finalPath);
                const zipEntries = zip.getEntries();
                const videoEntry = zipEntries.find(entry =>
                    entry.entryName.toLowerCase().endsWith('.mp4')
                );

                if (videoEntry) {
                    const newFilename = `${Date.now()}-${videoEntry.entryName}`;
                    const uploadsDir = path.join(__dirname, '../../uploads');
                    zip.extractEntryTo(videoEntry, uploadsDir, false, true, false, newFilename);
                    videoUrl = `/uploads/${newFilename}`;
                    // Borrar el zip ensamblado
                    fs.unlinkSync(finalPath);
                }
            }

            // Calcular el siguiente orden para la empresa
            const lastVideo = await Video.findOne({
                where: { empresa_id: session.empresa_id },
                order: [['orden', 'DESC']]
            });
            const nextOrder = lastVideo ? lastVideo.orden + 1 : 1;

            // Crear el registro de Video
            const video = await Video.create({
                nombre: session.nombre || session.original_filename,
                descripcion: session.descripcion,
                url: videoUrl,
                empresa_id: session.empresa_id,
                status: true,
                orden: nextOrder
            });

            // Actualizar sesión como completada
            await session.update({
                status: 'completed',
                video_id: video.id
            });

            // Limpiar directorio de chunks
            if (fs.existsSync(chunkDir)) {
                fs.rmSync(chunkDir, { recursive: true, force: true });
            }

            res.status(201).json({
                message: 'Video ensamblado y creado exitosamente',
                video
            });

        } catch (assemblyError) {
            // Si falla el ensamblaje, marcar como failed pero no borrar chunks
            // (para permitir reintentar)
            await session.update({
                status: 'failed',
                error_message: assemblyError.message
            });

            // Limpiar archivo parcial si existe
            if (fs.existsSync(finalPath)) {
                fs.unlinkSync(finalPath);
            }

            throw assemblyError;
        }

    } catch (error) {
        console.error('[VideoUpload] Error en completeUpload:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE /api/videos/upload/:uploadId
 * Aborta un upload y limpia recursos
 */
exports.abortUpload = async (req, res) => {
    try {
        const { uploadId } = req.params;

        const session = await UploadSession.findByPk(uploadId);
        if (!session) {
            return res.status(404).json({ message: 'Sesión de upload no encontrada' });
        }

        if (session.status === 'completed') {
            return res.status(409).json({
                message: 'No se puede abortar un upload ya completado'
            });
        }

        // Limpiar chunks del disco
        const chunkDir = path.join(__dirname, '../../uploads/chunks', session.id);
        if (fs.existsSync(chunkDir)) {
            fs.rmSync(chunkDir, { recursive: true, force: true });
        }

        // Marcar como failed
        await session.update({
            status: 'failed',
            error_message: 'Upload abortado por el usuario'
        });

        res.json({ message: 'Upload abortado y recursos limpiados' });
    } catch (error) {
        console.error('[VideoUpload] Error en abortUpload:', error);
        res.status(500).json({ message: error.message });
    }
};
