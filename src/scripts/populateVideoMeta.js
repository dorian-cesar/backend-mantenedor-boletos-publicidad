require('dotenv').config({ path: __dirname + '/../../.env' });
const { Video } = require('../models');
const { getVideoResolution } = require('../utils/videoMeta');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

async function populateVideoMeta() {
    try {
        console.log('--- Iniciando script de migración de metadata de videos ---');
        
        // Autenticar a la base de datos
        await sequelize.authenticate();
        console.log('Conexión a BD establecida.');
        
        // Obtener todos los videos
        const videos = await Video.findAll();
        console.log(`Se encontraron ${videos.length} videos en total.`);
        
        let actualizados = 0;
        let conErrores = 0;

        for (const video of videos) {
            console.log(`\nProcesando Video ID: ${video.id} - ${video.nombre}`);
            
            // Construir la ruta absoluta real del archivo usando el path relativo guardado en la url
            // Ejemplo de url: "/uploads/1715012345678-video.mp4"
            const urlPath = video.url.startsWith('/') ? video.url.substring(1) : video.url;
            const absolutePath = path.join(__dirname, '../../', urlPath);
            
            let necesitaActualizacion = false;
            let updateData = {};

            if (fs.existsSync(absolutePath)) {
                // 1. Validar y actualizar Peso
                if (!video.peso) {
                    const stats = fs.statSync(absolutePath);
                    updateData.peso = stats.size;
                    necesitaActualizacion = true;
                    console.log(`  - Peso calculado: ${stats.size} bytes`);
                }

                // 2. Validar y actualizar Extensión
                if (!video.extension) {
                    const ext = path.extname(absolutePath).toLowerCase();
                    updateData.extension = ext;
                    necesitaActualizacion = true;
                    console.log(`  - Extensión detectada: ${ext}`);
                }

                // 3. Validar y actualizar Resolución
                if (!video.resolucion) {
                    const resolucion = await getVideoResolution(absolutePath);
                    if (resolucion) {
                        updateData.resolucion = resolucion;
                        necesitaActualizacion = true;
                        console.log(`  - Resolución extraída: ${resolucion}`);
                    } else {
                        console.log(`  [!] No se pudo extraer la resolución del archivo`);
                    }
                }
                
                // Actualizar en base de datos si hay cambios
                if (necesitaActualizacion) {
                    await video.update(updateData);
                    actualizados++;
                    console.log(`  -> ¡Video ID ${video.id} actualizado correctamente!`);
                } else {
                    console.log(`  -> Video ya tenía toda la información. Se omite.`);
                }
                
            } else {
                console.log(`  [ERROR] El archivo físico no existe en la ruta esperada: ${absolutePath}`);
                conErrores++;
            }
        }
        
        console.log('\n--- Resumen de la migración ---');
        console.log(`Total videos procesados: ${videos.length}`);
        console.log(`Videos actualizados: ${actualizados}`);
        console.log(`Videos con errores (archivos faltantes): ${conErrores}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Ocurrió un error general:', error);
        process.exit(1);
    }
}

populateVideoMeta();
