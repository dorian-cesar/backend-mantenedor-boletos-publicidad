const { ApiKey } = require('../models');
const crypto = require('crypto');

exports.create = async (req, res) => {
    try {
        const { description } = req.body;
        const key = crypto.randomBytes(32).toString('hex');

        const apiKey = await ApiKey.create({
            key,
            description
        });

        res.status(201).json(apiKey);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const keys = await ApiKey.findAll();
        res.json(keys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = await ApiKey.findByPk(id);

        if (!apiKey) {
            return res.status(404).json({ message: 'API Key no encontrada' });
        }

        await apiKey.destroy();
        res.json({ message: 'API Key eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
