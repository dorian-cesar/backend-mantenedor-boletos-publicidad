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

exports.create = async (req, res) => {
    try {
        const { identificador, direccion, video_ids } = req.body;
        const totem = await Totem.create({ identificador, direccion });

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
        const { identificador, direccion, video_ids } = req.body;
        const totem = await Totem.findByPk(req.params.id);
        if (!totem) return res.status(404).json({ message: 'Totem no encontrado' });

        await totem.update({ identificador, direccion });

        if (video_ids) {
            await totem.setVideos(video_ids);
        }

        res.json(totem);
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
