const { LogOperacionBoleto } = require('../models');

// Crear un nuevo registro de log (Usualmente llamado desde el Frontend o un Webhook)
exports.createLog = async (req, res) => {
    try {
        const { ticket_number, operacion, estado, respuesta_integracion, mensaje_error, pais } = req.body;

        if (!ticket_number || !operacion || !estado) {
            return res.status(400).json({ message: 'ticket_number, operacion y estado son requeridos' });
        }

        const nuevoLog = await LogOperacionBoleto.create({
            ticket_number,
            operacion,
            estado,
            respuesta_integracion: respuesta_integracion || null,
            mensaje_error: mensaje_error || null,
            pais: pais || 'CL'
        });

        res.status(201).json({
            message: 'Log registrado exitosamente',
            log: nuevoLog
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los logs (Solo para ADMIN)
exports.getAllLogs = async (req, res) => {
    try {
        const { operacion, estado, pais } = req.query;
        let whereClause = {};

        if (operacion) whereClause.operacion = operacion;
        if (estado) whereClause.estado = estado;
        if (pais) whereClause.pais = pais;

        const logs = await LogOperacionBoleto.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
