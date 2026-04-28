const { Totem, Video, ApiKey, TotemVideo } = require('../models');
const jwt = require('jsonwebtoken');

const processVideoIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const rawIds = ids.map(item => typeof item === 'object' && item !== null ? item.id : item);
    const videos = await Video.findAll({ where: { id: rawIds } });
    
    return videos.map(v => {
        const itemIndex = ids.findIndex(item => (typeof item === 'object' && item !== null ? item.id : item) == v.id);
        const item = ids[itemIndex];
        const orden = typeof item === 'object' && item !== null ? item.orden : itemIndex + 1;
        v.TotemVideo = { orden };
        return v;
    });
};

exports.getAll = async (req, res) => {
    try {
        const totems = await Totem.findAll({
            include: [{ model: Video, as: 'videos', through: { attributes: ['orden'] } }]
        });
        res.json(totems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const totem = await Totem.findByPk(req.params.id, {
            include: [{ model: Video, as: 'videos', through: { attributes: ['orden'] } }]
        });
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });
        res.json(totem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPlaylist = async (req, res) => {
    try {
        // Si el usuario es un TOTEM, solo puede pedir su propia playlist
        if (req.user.rol === 'TOTEM' && parseInt(req.user.id) !== parseInt(req.params.id)) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a la playlist de otro tótem' });
        }

        const totem = await Totem.findByPk(req.params.id, {
            include: [{ 
                model: Video, 
                as: 'videos', 
                through: { attributes: ['orden'] },
                where: { status: true },
                required: false
            }],
            order: [[ { model: Video, as: 'videos' }, TotemVideo, 'orden', 'ASC']]
        });
        
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });
        
        // Retornamos solo la lista de videos formateada
        const playlist = totem.videos.map(v => ({
            id: v.id,
            nombre: v.nombre,
            url: v.url,
            orden: v.TotemVideo.orden
        }));

        res.json({
            totem_id: totem.id,
            identificador: totem.identificador,
            total_videos: playlist.length,
            playlist
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { identificador, direccion, latitud, longitud, video_ids } = req.body;
        const totem = await Totem.create({ identificador, direccion, latitud, longitud });

        if (video_ids && video_ids.length > 0) {
            const videosToSet = await processVideoIds(video_ids);
            await totem.setVideos(videosToSet);
        }

        res.status(201).json(totem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { identificador, direccion, latitud, longitud, video_ids } = req.body;
        const totem = await Totem.findByPk(req.params.id);
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });

        // En PUT solemos actualizar todos los campos principales
        await totem.update({ 
            identificador: identificador || totem.identificador, 
            direccion: direccion || totem.direccion, 
            latitud: latitud !== undefined ? latitud : totem.latitud, 
            longitud: longitud !== undefined ? longitud : totem.longitud 
        });

        if (video_ids) {
            const videosToSet = await processVideoIds(video_ids);
            await totem.setVideos(videosToSet);
        }

        res.json(totem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.patch = async (req, res) => {
    try {
        const totem = await Totem.findByPk(req.params.id);
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });

        // PATCH solo actualiza los campos presentes en req.body
        await totem.update(req.body);

        if (req.body.video_ids) {
            const videosToSet = await processVideoIds(req.body.video_ids);
            await totem.setVideos(videosToSet);
        }

        res.json(totem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateCoordinates = async (req, res) => {
    try {
        const { latitud, longitud } = req.body;
        const totem = await Totem.findByPk(req.params.id);
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });

        await totem.update({ latitud, longitud });

        res.json({
            message: 'Coordenadas actualizadas correctamente',
            totem: {
                id: totem.id,
                latitud: totem.latitud,
                longitud: totem.longitud
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const totem = await Totem.findByPk(req.params.id);
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });
        await totem.destroy();
        res.json({ message: 'Totem eliminado (soft delete)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addVideos = async (req, res) => {
    try {
        const { id } = req.params;
        const { video_ids } = req.body;

        if (!video_ids || !Array.isArray(video_ids) || video_ids.length === 0) {
            return res.status(400).json({ message: 'Se requiere un arreglo video_ids no vacío' });
        }

        const totem = await Totem.findByPk(id);
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });

        // Obtener el orden máximo actual
        const lastVideo = await TotemVideo.findOne({
            where: { totem_id: id },
            order: [['orden', 'DESC']]
        });

        let nextOrder = lastVideo ? lastVideo.orden + 1 : 1;

        // Agregar videos uno por uno para asignar el orden
        const results = [];
        for (const videoId of video_ids) {
            // Verificar si ya existe para evitar duplicados en la asociación
            const exists = await TotemVideo.findOne({ where: { totem_id: id, video_id: videoId } });
            if (!exists) {
                const tv = await TotemVideo.create({
                    totem_id: id,
                    video_id: videoId,
                    orden: nextOrder++
                });
                results.push(tv);
            }
        }

        res.status(201).json({
            message: `${results.length} videos agregados correctamente`,
            added: results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeVideo = async (req, res) => {
    try {
        const { id, videoId } = req.params;

        const deleted = await TotemVideo.destroy({
            where: {
                totem_id: id,
                video_id: videoId
            }
        });

        if (deleted === 0) {
            return res.status(404).json({ message: 'Asociación no encontrada' });
        }

        res.json({ message: 'Video removido del tótem correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginTotem = async (req, res) => {
    try {
        const { id, apiKey } = req.body;
        
        if (!id || !apiKey) {
            return res.status(400).json({ message: 'Se requiere id y apiKey en el cuerpo de la petición' });
        }

        // Buscamos el totem
        const totem = await Totem.findByPk(id);
        if (!totem) {
            return res.status(404).json({ message: 'Totem no encontrado' });
        }

        // Validamos que el API Key exista, sea de tipo TOTEM y esté asociada a este totem
        const keyRecord = await ApiKey.findOne({ 
            where: { 
                key: apiKey, 
                totem_id: id,
                status: true,
                tipo: 'TOTEM'
            } 
        });

        if (!keyRecord) {
            return res.status(403).json({ 
                message: 'Credenciales de tótem inválidas o llave inactiva' 
            });
        }

        // Generamos un JWT de larga duración para el tótem (ej: 1 año)
        const token = jwt.sign(
            { 
                id: totem.id, 
                identificador: totem.identificador, 
                tipo: 'TOTEM',
                rol: 'TOTEM' // Añadimos rol por compatibilidad con middlewares existentes
            },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );

        res.json({
            message: 'Login de tótem exitoso',
            token,
            totem: {
                id: totem.id,
                identificador: totem.identificador,
                direccion: totem.direccion
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
