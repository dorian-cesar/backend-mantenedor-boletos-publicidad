const { Devolucion, Totem, Usuario } = require('../models');

// Registrar una devolución (desde Totem o Web)
exports.create = async (req, res) => {
    try {
        const { ticket_number, monto, origen, motivo, totem_id } = req.body;

        if (!ticket_number || monto === undefined) {
            return res.status(400).json({ message: 'Se requieren ticket_number y monto' });
        }

        const nuevaDevolucion = await Devolucion.create({
            ticket_number,
            monto,
            origen: origen || 'WEB',
            motivo,
            totem_id: totem_id || (req.user && req.user.rol === 'TOTEM' ? req.user.id : null),
            estado: 'PENDIENTE'
        });

        res.status(201).json({
            message: 'Devolución registrada exitosamente',
            devolucion: nuevaDevolucion
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas las devoluciones (Para panel de FINANZAS / ADMIN)
exports.getAll = async (req, res) => {
    try {
        const devoluciones = await Devolucion.findAll({
            include: [
                { model: Totem, as: 'totem', attributes: ['identificador', 'direccion'] },
                { model: Usuario, as: 'gestor', attributes: ['nombre', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(devoluciones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar estado de una devolución (solo FINANZAS / ADMIN)
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['PENDIENTE', 'APROBADA', 'RECHAZADA'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        const devolucion = await Devolucion.findByPk(id);
        if (!devolucion) {
            return res.status(404).json({ message: 'Devolución no encontrada' });
        }

        devolucion.estado = estado;
        devolucion.usuario_id = req.user.id; // Registrar quién hizo el cambio
        await devolucion.save();

        res.json({ message: 'Estado actualizado correctamente', devolucion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
