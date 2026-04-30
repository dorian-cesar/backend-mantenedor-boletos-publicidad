const { Video } = require('../src/models');
const sequelize = require('../src/config/database');

async function updateDescriptions() {
    try {
        console.log('Sincronizando base de datos...');
        await sequelize.sync({ alter: true });
        console.log('Base de datos sincronizada.');
        
        console.log('Iniciando actualización de descripciones en videos...');
        
        // Buscar videos con descripción null
        const videos = await Video.findAll({
            where: {
                descripcion: null
            }
        });

        console.log(`Se encontraron ${videos.length} videos con descripción null.`);

        if (videos.length === 0) {
            console.log('No hay videos que actualizar.');
            return;
        }

        let updatedCount = 0;
        for (const video of videos) {
            // Aquí puedes personalizar el mensaje por defecto
            await video.update({
                descripcion: `Video: ${video.nombre}`
            });
            updatedCount++;
        }

        console.log(`Éxito: Se actualizaron ${updatedCount} videos.`);
    } catch (error) {
        console.error('Error al actualizar videos:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

updateDescriptions();
