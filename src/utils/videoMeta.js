const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');

// Configuramos fluent-ffmpeg para que use el binario estático incluido
ffmpeg.setFfprobePath(ffprobeStatic.path);
/**
 * Extrae la resolución de un archivo de video
 * @param {string} filePath Ruta absoluta o relativa al archivo de video
 * @returns {Promise<string>} Resolución en formato "Ancho x Alto" (ej. "1920x1080"), o null si falla
 */
const getVideoResolution = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error('[VideoMeta] Error al extraer metadata con ffprobe:', err.message);
                // No rechazamos para no bloquear la subida, simplemente devolvemos null
                return resolve(null);
            }

            try {
                // Buscamos el stream de video
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                
                if (!videoStream) {
                    console.warn('[VideoMeta] No se encontró un stream de video en el archivo.');
                    return resolve(null);
                }

                let width = videoStream.width;
                let height = videoStream.height;

                // Manejar rotación (común en videos grabados con celulares como iPhone .mov)
                // Si la rotación es de 90 o 270 grados, el ancho y el alto están invertidos visualmente
                if (videoStream.tags && videoStream.tags.rotate) {
                    const rotation = parseInt(videoStream.tags.rotate, 10);
                    if (rotation === 90 || rotation === 270) {
                        width = videoStream.height;
                        height = videoStream.width;
                    }
                } else if (videoStream.side_data_list) {
                    // ffmpeg más moderno guarda la rotación en side_data_list (displaymatrix)
                    const displayMatrix = videoStream.side_data_list.find(sd => sd.side_data_type === 'Display Matrix');
                    if (displayMatrix && displayMatrix.rotation) {
                        const rotation = Math.abs(parseInt(displayMatrix.rotation, 10));
                        if (rotation === 90 || rotation === 270) {
                            width = videoStream.height;
                            height = videoStream.width;
                        }
                    }
                }

                if (width && height) {
                    resolve(`${width}x${height}`);
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('[VideoMeta] Error procesando metadata:', error.message);
                resolve(null);
            }
        });
    });
};

module.exports = {
    getVideoResolution
};
