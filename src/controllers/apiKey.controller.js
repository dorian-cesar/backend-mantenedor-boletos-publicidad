const { ApiKey, Totem } = require('../models');
const crypto = require('crypto');

exports.create = async (req, res) => {
    try {
        const { description, tipo, totem_id } = req.body;
        
        // Si es tipo TOTEM, validamos que venga el totem_id
        if (tipo === 'TOTEM' && !totem_id) {
            return res.status(400).json({ message: 'Se requiere totem_id para una API Key de tipo TOTEM' });
        }

        // Si es tipo PLATAFORMA, no debe permitir totem_id
        if (tipo === 'PLATAFORMA' && totem_id) {
            return res.status(400).json({ message: 'Una API Key de tipo PLATAFORMA no puede tener un totem_id asociado' });
        }

        let key;
        if (tipo === 'TOTEM') {
            // Generamos una llave corta de 6 caracteres alfanuméricos para los tótems
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            key = '';
            for (let i = 0; i < 6; i++) {
                key += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } else {
            // Para plataforma seguimos usando una llave larga y segura
            key = crypto.randomBytes(32).toString('hex');
        }
        
        const apiKey = await ApiKey.create({
            key,
            description,
            tipo: tipo || 'PLATAFORMA',
            totem_id: tipo === 'TOTEM' ? totem_id : null
        });

        res.status(201).json(apiKey);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const keys = await ApiKey.findAll({
            include: [{ model: Totem, as: 'totem', attributes: ['id', 'identificador', 'direccion'] }]
        });
        res.json(keys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, status, tipo, totem_id } = req.body;
        const apiKey = await ApiKey.findByPk(id);

        if (!apiKey) {
            return res.status(404).json({ message: 'API Key no encontrada' });
        }

        // Si se cambia a tipo TOTEM, validamos que venga el totem_id
        if (tipo === 'TOTEM' && !totem_id) {
            return res.status(400).json({ message: 'Se requiere totem_id para una API Key de tipo TOTEM' });
        }

        // Si se cambia a tipo PLATAFORMA, no debe permitir totem_id
        if (tipo === 'PLATAFORMA' && totem_id) {
            return res.status(400).json({ message: 'Una API Key de tipo PLATAFORMA no puede tener un totem_id asociado' });
        }

        const updateData = {};
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (tipo !== undefined) updateData.tipo = tipo;
        
        if (tipo === 'TOTEM') {
            updateData.totem_id = totem_id;
        } else if (tipo === 'PLATAFORMA') {
            updateData.totem_id = null;
        } else if (totem_id !== undefined) {
            updateData.totem_id = totem_id;
        }

        await apiKey.update(updateData);

        res.json(apiKey);
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
