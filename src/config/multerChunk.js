const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Crea una instancia de Multer configurada para recibir un chunk individual.
 * El directorio destino se crea dinámicamente basado en el uploadId del request.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadId = req.params.uploadId;
        const chunkDir = path.join(__dirname, '../../uploads/chunks', uploadId);

        // Crear el directorio si no existe
        fs.mkdirSync(chunkDir, { recursive: true });
        cb(null, chunkDir);
    },
    filename: (req, file, cb) => {
        const index = req.params.index;
        cb(null, `${index}.part`);
    }
});

const getChunkSize = () => {
    return parseInt(process.env.CHUNK_SIZE) || (2 * 1024 * 1024); // Default 2MB
};

const uploadChunk = multer({
    storage: storage,
    limits: {
        fileSize: getChunkSize() + 1024 // chunk_size + 1KB margen
    }
});

module.exports = uploadChunk;
