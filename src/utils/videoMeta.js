const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');

// Configuramos fluent-ffmpeg para que use el binario estático incluido
ffmpeg.setFfprobePath(ffprobeStatic.path);

/**
 * Extrae la metadata (resolución y duración) de un archivo de video
 * @param {string} filePath Ruta absoluta o relativa al archivo de video
 * @returns {Promise<Object>} Objeto con resolution ("Ancho x Alto") y duration (segundos)
 */
const getVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error('[VideoMeta] Error al extraer metadata con ffprobe:', err.message);
                return resolve({ resolution: null, duration: null });
            }

            try {
                // Buscamos el stream de video
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                
                if (!videoStream) {
                    console.warn('[VideoMeta] No se encontró un stream de video en el archivo.');
                    return resolve({ resolution: null, duration: null });
                }

                let width = videoStream.width;
                let height = videoStream.height;

                // Manejar rotación
                if (videoStream.tags && videoStream.tags.rotate) {
                    const rotation = parseInt(videoStream.tags.rotate, 10);
                    if (rotation === 90 || rotation === 270) {
                        width = videoStream.height;
                        height = videoStream.width;
                    }
                } else if (videoStream.side_data_list) {
                    const displayMatrix = videoStream.side_data_list.find(sd => sd.side_data_type === 'Display Matrix');
                    if (displayMatrix && displayMatrix.rotation) {
                        const rotation = Math.abs(parseInt(displayMatrix.rotation, 10));
                        if (rotation === 90 || rotation === 270) {
                            width = videoStream.height;
                            height = videoStream.width;
                        }
                    }
                }

                let resolution = (width && height) ? `${width}x${height}` : null;

                // Extraer duración
                let duration = null;
                if (metadata.format && metadata.format.duration) {
                    duration = Math.round(parseFloat(metadata.format.duration));
                } else if (videoStream.duration) {
                    duration = Math.round(parseFloat(videoStream.duration));
                }

                resolve({ resolution, duration });
            } catch (error) {
                console.error('[VideoMeta] Error procesando metadata:', error.message);
                resolve({ resolution: null, duration: null });
            }
        });
    });
};

module.exports = {
    getVideoMetadata
};
