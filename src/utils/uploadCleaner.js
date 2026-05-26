const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * Limpia sesiones de upload expiradas:
 * 1. Busca sesiones con expires_at < NOW() y status pending/uploading
 * 2. Elimina directorios de chunks del disco
 * 3. Marca las sesiones como 'expired'
 */
async function cleanExpiredUploads() {
    try {
        // Import dinámico para evitar circular dependency al arranque
        const UploadSession = require('../models/UploadSession');

        const expiredSessions = await UploadSession.findAll({
            where: {
                expires_at: { [Op.lt]: new Date() },
                status: { [Op.in]: ['pending', 'uploading'] }
            }
        });

        if (expiredSessions.length === 0) return;

        console.log(`[UploadCleaner] Encontradas ${expiredSessions.length} sesiones expiradas`);

        for (const session of expiredSessions) {
            // Eliminar directorio de chunks
            const chunkDir = path.join(__dirname, '../../uploads/chunks', session.id);
            if (fs.existsSync(chunkDir)) {
                fs.rmSync(chunkDir, { recursive: true, force: true });
                console.log(`[UploadCleaner] Eliminado directorio: ${chunkDir}`);
            }

            // Marcar como expirada
            await session.update({ status: 'expired' });
        }

        console.log(`[UploadCleaner] Limpieza completada: ${expiredSessions.length} sesiones expiradas`);
    } catch (error) {
        console.error('[UploadCleaner] Error en limpieza:', error.message);
    }
}

/**
 * Inicia el proceso de limpieza periódica
 * @param {number} intervalMs - Intervalo en milisegundos (default: 1 hora)
 */
function startUploadCleaner(intervalMs = 60 * 60 * 1000) {
    // Ejecutar una limpieza inicial
    cleanExpiredUploads();

    // Programar limpieza periódica
    const intervalId = setInterval(cleanExpiredUploads, intervalMs);
    console.log(`[UploadCleaner] Limpieza programada cada ${intervalMs / 1000 / 60} minutos`);

    return intervalId;
}

module.exports = { cleanExpiredUploads, startUploadCleaner };
