const { VentaBoleto, Totem } = require('../models');
const { Op } = require('sequelize');

exports.registrarVenta = async (req, res) => {
    try {
        const { payload_request, payload_response } = req.body;

        if (!payload_request || !payload_response) {
            return res.status(400).json({ message: 'Se requiere payload_request y payload_response' });
        }

        // Determinar el totem_id
        let totem_id = req.user.rol === 'TOTEM' ? req.user.id : req.body.totem_id;

        if (!totem_id) {
            return res.status(400).json({ message: 'Se requiere totem_id' });
        }

        // Extraer información útil para facilitar la auditoría directa
        const ticket_numbers = payload_response.data?.ticketNumbers || [];
        const total_amount = payload_request.totalAmount || 0;
        const status = payload_response.status || (payload_response.success ? 'success' : 'error');
        const operation = payload_response.operation || 'sell';
        const provider = payload_response.provider || 'unknown';
        const timestamp_operacion = payload_response.meta?.timestamp || new Date();

        const venta = await VentaBoleto.create({
            totem_id,
            payload_request,
            payload_response,
            ticket_numbers,
            total_amount,
            status,
            operation,
            provider,
            timestamp_operacion
        });
        const { getIO } = require('../sockets/totem.sockets');
        const io = getIO();
        if (io) {
            io.to('room:admins').emit('admin:ventas_updated');
        }

        res.status(201).json({
            message: 'Venta registrada exitosamente',
            venta_id: venta.id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAuditoria = async (req, res) => {
    try {
        const { totem_id, fecha_inicio, fecha_fin } = req.query;
        const where = {};

        if (totem_id) {
            where.totem_id = totem_id;
        }

        if (fecha_inicio && fecha_fin) {
            where.timestamp_operacion = {
                [Op.between]: [fecha_inicio, fecha_fin]
            };
        } else if (fecha_inicio) {
            where.timestamp_operacion = {
                [Op.gte]: fecha_inicio
            };
        } else if (fecha_fin) {
            where.timestamp_operacion = {
                [Op.lte]: fecha_fin
            };
        }

        const ventas = await VentaBoleto.findAll({
            where,
            include: [{
                model: Totem,
                as: 'totem',
                attributes: ['identificador', 'direccion']
            }],
            order: [['timestamp_operacion', 'DESC']]
        });

        // Calcular totales básicos para el reporte
        const total_ventas = ventas.length;
        const monto_total = ventas.reduce((sum, v) => sum + parseFloat(v.total_amount), 0);
        const exitosas = ventas.filter(v => v.status === 'success').length;
        const fallidas = total_ventas - exitosas;

        res.json({
            summary: {
                total_ventas,
                monto_total,
                exitosas,
                fallidas
            },
            ventas
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
