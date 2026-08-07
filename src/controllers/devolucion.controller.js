const { Devolucion, Totem, Usuario } = require('../models');

// Registrar una devolución (desde Totem o Web)
exports.create = async (req, res) => {
    try {
        const { ticket_number, monto, origen, pais, motivo, totem_id, datos_pasajero, datos_boleto, datos_bancarios } = req.body;

        if (!ticket_number || monto === undefined) {
            return res.status(400).json({ message: 'Se requieren ticket_number y monto' });
        }

        const nuevaDevolucion = await Devolucion.create({
            ticket_number,
            monto,
            origen: origen || 'WEB',
            pais: pais || 'CL', // Por defecto CL, pero el front debe enviarlo (PY, PE, etc.)
            motivo,
            datos_pasajero: datos_pasajero || null,
            datos_boleto: datos_boleto || null,
            datos_bancarios: datos_bancarios || null,
            totem_id: totem_id || (req.user && req.user.rol === 'TOTEM' ? req.user.id : null),
            estado: 'PENDIENTE'
        });

        // Emitir evento por WebSockets para actualizar el dashboard en tiempo real
        const io = req.app.get('io');
        if (io) {
            io.emit('nueva_devolucion', nuevaDevolucion);
        }

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
        const { estado, porcentaje_devolucion, resolucion_descripcion } = req.body;

        if (!['PENDIENTE', 'APROBADA', 'RECHAZADA'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        const devolucion = await Devolucion.findByPk(id);
        if (!devolucion) {
            return res.status(404).json({ message: 'Devolución no encontrada' });
        }

        devolucion.estado = estado;
        if (porcentaje_devolucion !== undefined) devolucion.porcentaje_devolucion = porcentaje_devolucion;
        if (resolucion_descripcion !== undefined) devolucion.resolucion_descripcion = resolucion_descripcion;
        
        devolucion.usuario_id = req.user.id; // Registrar quién tomó la decisión (usuario de Finanzas)
        await devolucion.save();

        // Emitir actualización por WebSockets
        const io = req.app.get('io');
        if (io) {
            io.emit('devolucion_actualizada', devolucion);
        }

        res.json({ message: 'Resolución guardada correctamente', devolucion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
