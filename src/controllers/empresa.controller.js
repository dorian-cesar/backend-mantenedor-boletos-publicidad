const { Empresa, Video } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const empresas = await Empresa.findAll();
        res.json(empresas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(req.params.id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const empresa = await Empresa.create(req.body);
        res.status(201).json(empresa);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(req.params.id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        await empresa.update(req.body);
        res.json(empresa);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(req.params.id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        await empresa.destroy(); // Soft delete
        res.json({ message: 'Empresa eliminada (soft delete)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVideosByEmpresa = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit } = req.query;
        // Soportamos múltiples IDs separados por comas (ej: 1,2,3)
        const ids = id.split(',').map(i => i.trim()).filter(i => i !== '');

        const options = {
            where: { 
                empresa_id: ids,
                status: true 
            },
            attributes: ['id', 'nombre', 'empresa_id']
        };

        if (limit) {
            options.limit = parseInt(limit);
            // Si hay límite, solemos querer videos aleatorios o por algún criterio
            // Para este caso, usaremos orden aleatorio si se pide límite
            options.order = [require('../models').sequelize.random()];
        }

        const videos = await Video.findAll(options);

        res.json({
            total: videos.length,
            videos
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
