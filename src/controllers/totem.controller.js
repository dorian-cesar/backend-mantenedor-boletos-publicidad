const { Totem, Video } = require('../models');

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
        const totem = await Totem.findByPk(req.params.id, {
            include: [{ 
                model: Video, 
                as: 'videos', 
                through: { attributes: ['orden'] },
                where: { status: true } 
            }],
            order: [[ { model: Video, as: 'videos' }, 'TotemVideo', 'orden', 'ASC']]
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
            await totem.setVideos(video_ids);
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

        await totem.update({ identificador, direccion, latitud, longitud });

        if (video_ids) {
            await totem.setVideos(video_ids);
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
