const fs = require('fs');
const path = require('path');
const Video = require('../src/models/Video');
const sequelize = require('../src/config/database');

async function updateOldVideos() {
    try {
        console.log('Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('Obteniendo videos...');

        const videos = await Video.findAll();
        let updatedCount = 0;
        let skippedCount = 0;

        for (const video of videos) {
            // Check if it already has both values, maybe we can skip
            if (video.peso !== null && video.extension !== null) {
                console.log(`Video ID ${video.id} ya tiene peso y extensión. Saltando...`);
                skippedCount++;
                continue;
            }

            if (!video.url) {
                console.log(`Video ID ${video.id} no tiene URL. Saltando...`);
                skippedCount++;
                continue;
            }

            // Construct the physical file path. Assuming url is like "/uploads/123.mp4"
            // The file should be in the root `uploads/` directory, so we go up from scripts
            const relativeFilePath = video.url.replace(/^\//, ''); // removes leading slash
            const fullPath = path.join(__dirname, '..', relativeFilePath);

            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                const peso = stats.size;
                const extension = path.extname(fullPath).toLowerCase();

                video.peso = peso;
                video.extension = extension;
                await video.save();

                console.log(`Video ID ${video.id} actualizado: Peso=${peso}, Extensión=${extension}`);
                updatedCount++;
            } else {
                console.log(`Archivo no encontrado para Video ID ${video.id}: ${fullPath}`);
                skippedCount++;
            }
        }

        console.log(`\nResumen: ${updatedCount} actualizados, ${skippedCount} saltados.`);
    } catch (error) {
        console.error('Error al actualizar videos:', error);
    } finally {
        process.exit(0);
    }
}

updateOldVideos();
