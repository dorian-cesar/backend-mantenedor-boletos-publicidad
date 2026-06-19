const { Video, Empresa } = require('../models');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const { getVideoMetadata } = require('../utils/videoMeta');

exports.getAll = async (req, res) => {
    try {
        const videos = await Video.findAll({
            order: [['orden', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video no encontrado' });
        res.json(video);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, descripcion, empresa_id } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún video o archivo comprimido.' });
        }

        let videoUrl = `/uploads/${req.file.filename}`;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let peso = req.file.size;
        let extension = ext;

        let resolucion = null;
        let duracion = null;

        // Lógica de descompresión si es un ZIP
        if (ext === '.zip') {
            const zip = new AdmZip(req.file.path);
            const zipEntries = zip.getEntries();
            const videoEntry = zipEntries.find(entry => 
                entry.entryName.toLowerCase().endsWith('.mp4') || 
                entry.entryName.toLowerCase().endsWith('.mov')
            );

            if (videoEntry) {
                const newFilename = `${Date.now()}-${videoEntry.entryName}`;
                zip.extractEntryTo(videoEntry, 'uploads/', false, true, newFilename);
                videoUrl = `/uploads/${newFilename}`;
                
                const finalPath = path.join('uploads', newFilename);
                const stats = fs.statSync(finalPath);
                peso = stats.size;
                extension = path.extname(newFilename).toLowerCase();
                const meta = await getVideoMetadata(finalPath);
                resolucion = meta.resolution;
                duracion = meta.duration;

                // Opcional: borrar el zip original
                fs.unlinkSync(req.file.path);
            }
        } else {
            // No es zip, extraer resolución directo del archivo subido
            const meta = await getVideoMetadata(req.file.path);
            resolucion = meta.resolution;
            duracion = meta.duration;
        }

        // Calcular el siguiente número de orden para esta empresa
        const lastVideo = await Video.findOne({
            where: { empresa_id },
            order: [['orden', 'DESC']]
        });
        const nextOrder = lastVideo ? lastVideo.orden + 1 : 1;

        const video = await Video.create({
            nombre: nombre || req.file.originalname,
            descripcion,
            url: videoUrl,
            empresa_id,
            peso,
            extension,
            resolucion,
            duracion,
            status: true,
            orden: nextOrder
        });

        res.status(201).json(video);

        // WS Push
        const io = req.app.get('io');
        if (io) {
            const allVideos = await Video.findAll({ order: [['orden', 'ASC'], ['createdAt', 'DESC']] });
            io.to('room:admins').emit('admin:videos_updated', allVideos);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, empresa_id, status, orden } = req.body;
        
        const video = await Video.findByPk(id);
        if (!video) return res.status(404).json({ message: 'Video no encontrado' });

        let updateData = {
            nombre: nombre !== undefined ? nombre : video.nombre,
            descripcion: descripcion !== undefined ? descripcion : video.descripcion,
            empresa_id: empresa_id !== undefined ? empresa_id : video.empresa_id,
            status: status !== undefined ? (status === 'true' || status === true) : video.status,
            orden: orden !== undefined ? parseInt(orden) : video.orden
        };

        if (req.file) {
            let videoUrl = `/uploads/${req.file.filename}`;
            const ext = path.extname(req.file.originalname).toLowerCase();
            let peso = req.file.size;
            let extension = ext;

            let resolucion = null;
            let duracion = null;

            // Lógica de descompresión si es un ZIP
            if (ext === '.zip') {
                const zip = new AdmZip(req.file.path);
                const zipEntries = zip.getEntries();
                const videoEntry = zipEntries.find(entry => 
                    entry.entryName.toLowerCase().endsWith('.mp4') || 
                    entry.entryName.toLowerCase().endsWith('.mov')
                );

                if (videoEntry) {
                    const newFilename = `${Date.now()}-${videoEntry.entryName}`;
                    zip.extractEntryTo(videoEntry, 'uploads/', false, true, newFilename);
                    videoUrl = `/uploads/${newFilename}`;
                    
                    const finalPath = path.join('uploads', newFilename);
                    const stats = fs.statSync(finalPath);
                    peso = stats.size;
                    extension = path.extname(newFilename).toLowerCase();
                    const meta = await getVideoMetadata(finalPath);
                    resolucion = meta.resolution;
                    duracion = meta.duration;
                    
                    fs.unlinkSync(req.file.path);
                }
            } else {
                const meta = await getVideoMetadata(req.file.path);
                resolucion = meta.resolution;
                duracion = meta.duration;
            }
            
            // Opcional: borrar el archivo anterior si es diferente
            // const oldPath = path.join(__dirname, '../../', video.url);
            // if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            updateData.url = videoUrl;
            updateData.peso = peso;
            updateData.extension = extension;
            if (resolucion) updateData.resolucion = resolucion;
            if (duracion) updateData.duracion = duracion;
        }

        await video.update(updateData);
        res.json(video);

        // WS Push
        const io = req.app.get('io');
        if (io) {
            const allVideos = await Video.findAll({ order: [['orden', 'ASC'], ['createdAt', 'DESC']] });
            io.to('room:admins').emit('admin:videos_updated', allVideos);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video no encontrado' });
        await video.destroy();
        res.json({ message: 'Video eliminado (soft delete)' });

        // WS Push
        const io = req.app.get('io');
        if (io) {
            const allVideos = await Video.findAll({ order: [['orden', 'ASC'], ['createdAt', 'DESC']] });
            io.to('room:admins').emit('admin:videos_updated', allVideos);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.bulkUpdateOrder = async (req, res) => {
    try {
        const { videos } = req.body; // Esperamos un arreglo [{id: 1, orden: 1}, {id: 2, orden: 2}]

        if (!videos || !Array.isArray(videos)) {
            return res.status(400).json({ message: 'Se requiere un arreglo de videos con id y orden' });
        }

        const promises = videos.map(v => 
            Video.update({ orden: v.orden }, { where: { id: v.id } })
        );

        await Promise.all(promises);

        res.json({ message: 'Orden actualizado correctamente' });

        // WS Push
        const io = req.app.get('io');
        if (io) {
            const allVideos = await Video.findAll({ order: [['orden', 'ASC'], ['createdAt', 'DESC']] });
            io.to('room:admins').emit('admin:videos_updated', allVideos);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadChunk = async (req, res) => {
    try {
        const { chunkIndex, totalChunks, identifier, originalName, nombre, descripcion, empresa_id } = req.body;
        
        if (!req.file) return res.status(400).json({ message: 'No se envió ningún fragmento (chunk)' });

        const chunkDir = path.join(__dirname, '../../uploads/', `chunks_${identifier}`);
        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir, { recursive: true });
        }

        const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);
        fs.renameSync(req.file.path, chunkPath);

        const currentIndex = parseInt(chunkIndex);
        const total = parseInt(totalChunks);

        if (currentIndex === total - 1) {
            // Unir los chunks
            const finalFilename = `${Date.now()}-${originalName}`;
            const finalPath = path.join(__dirname, '../../uploads/', finalFilename);
            
            const writeStream = fs.createWriteStream(finalPath);
            
            for (let i = 0; i < total; i++) {
                const currentChunkPath = path.join(chunkDir, `chunk_${i}`);
                if (fs.existsSync(currentChunkPath)) {
                    const data = fs.readFileSync(currentChunkPath);
                    writeStream.write(data);
                    fs.unlinkSync(currentChunkPath);
                } else {
                    return res.status(400).json({ message: `Falta el fragmento ${i}` });
                }
            }
            writeStream.end();
            fs.rmdirSync(chunkDir);

            // Crear registro en la BD
            let videoUrl = `/uploads/${finalFilename}`;
            let peso = fs.statSync(finalPath).size;
            let extension = path.extname(originalName).toLowerCase();
            
            let resolucion = null;
            let duracion = null;
            
            const ext = path.extname(originalName).toLowerCase();
            if (ext === '.zip') {
                const zip = new AdmZip(finalPath);
                const zipEntries = zip.getEntries();
                const videoEntry = zipEntries.find(entry => 
                    entry.entryName.toLowerCase().endsWith('.mp4') || 
                    entry.entryName.toLowerCase().endsWith('.mov')
                );

                if (videoEntry) {
                    const newFilename = `${Date.now()}-${videoEntry.entryName}`;
                    zip.extractEntryTo(videoEntry, 'uploads/', false, true, newFilename);
                    videoUrl = `/uploads/${newFilename}`;
                    
                    const extractedPath = path.join('uploads', newFilename);
                    peso = fs.statSync(extractedPath).size;
                    extension = path.extname(newFilename).toLowerCase();
                    const meta = await getVideoMetadata(extractedPath);
                    resolucion = meta.resolution;
                    duracion = meta.duration;
                    
                    fs.unlinkSync(finalPath);
                }
            } else {
                const meta = await getVideoMetadata(finalPath);
                resolucion = meta.resolution;
                duracion = meta.duration;
            }

            const lastVideo = await Video.findOne({
                where: { empresa_id },
                order: [['orden', 'DESC']]
            });
            const nextOrder = lastVideo ? lastVideo.orden + 1 : 1;

            const video = await Video.create({
                nombre: nombre || originalName,
                descripcion,
                url: videoUrl,
                empresa_id,
                peso,
                extension,
                resolucion,
                duracion,
                status: true,
                orden: nextOrder
            });

            res.status(201).json(video);

            // WS Push
            const io = req.app.get('io');
            if (io) {
                const allVideos = await Video.findAll({ order: [['orden', 'ASC'], ['createdAt', 'DESC']] });
                io.to('room:admins').emit('admin:videos_updated', allVideos);
            }
            return;
        }

        res.json({ message: 'Chunk recibido', chunkIndex });
    } catch (error) {
        console.error("Error en uploadChunk:", error);
        res.status(500).json({ message: error.message });
    }
};
