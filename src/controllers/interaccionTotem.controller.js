const { InteraccionTotem, Totem } = require('../models');
const { Op, fn, col } = require('sequelize');

// Registrar una nueva interacción
exports.registrar = async (req, res) => {
    try {
        // Determinar el totem_id
        let totem_id = req.user.rol === 'TOTEM' ? req.user.id : req.body.totem_id;

        if (!totem_id) {
            return res.status(400).json({ message: 'Se requiere totem_id' });
        }

        const { 
            exitosa, 
            paso_alcanzado, 
            pasos_completados, 
            motivo_fallo, 
            duracion_segundos,
            metadata 
        } = req.body;

        if (exitosa === undefined || exitosa === null) {
            return res.status(400).json({ message: 'Se requiere el campo exitosa (boolean)' });
        }

        const interaccion = await InteraccionTotem.create({
            totem_id,
            exitosa,
            paso_alcanzado: paso_alcanzado || (exitosa ? 'completado' : 'desconocido'),
            pasos_completados: pasos_completados || [],
            motivo_fallo: !exitosa ? (motivo_fallo || null) : null,
            duracion_segundos: duracion_segundos || null,
            metadata: metadata || null
        });

        res.status(201).json({
            message: 'Interacción registrada exitosamente',
            interaccion_id: interaccion.id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener estadísticas de interacciones por totem
exports.getEstadisticas = async (req, res) => {
    try {
        const { totem_id, fecha_inicio, fecha_fin } = req.query;
        const where = {};

        if (totem_id) {
            where.totem_id = totem_id;
        }

        if (fecha_inicio && fecha_fin) {
            where.createdAt = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        } else if (fecha_inicio) {
            where.createdAt = { [Op.gte]: new Date(fecha_inicio) };
        } else if (fecha_fin) {
            where.createdAt = { [Op.lte]: new Date(fecha_fin) };
        }

        // Totales generales
        const total = await InteraccionTotem.count({ where });
        const exitosas = await InteraccionTotem.count({ where: { ...where, exitosa: true } });
        const fallidas = total - exitosas;
        const tasa_exito = total > 0 ? ((exitosas / total) * 100).toFixed(2) : 0;

        // Desglose de pasos alcanzados en interacciones fallidas
        const fallosPorPaso = await InteraccionTotem.findAll({
            attributes: [
                'paso_alcanzado',
                [fn('COUNT', col('id')), 'cantidad']
            ],
            where: { ...where, exitosa: false },
            group: ['paso_alcanzado'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            raw: true
        });

        // Estadísticas por totem
        const porTotem = await InteraccionTotem.findAll({
            attributes: [
                'totem_id',
                [fn('COUNT', col('InteraccionTotem.id')), 'total_interacciones'],
                [fn('SUM', fn('IF', col('exitosa'), 1, 0)), 'exitosas'],
                [fn('SUM', fn('IF', col('exitosa'), 0, 1)), 'fallidas']
            ],
            where,
            include: [{
                model: Totem,
                as: 'totem',
                attributes: ['identificador', 'direccion']
            }],
            group: ['totem_id', 'totem.id'],
            raw: true,
            nest: true
        });

        res.json({
            resumen: {
                total_interacciones: total,
                exitosas,
                fallidas,
                tasa_exito: parseFloat(tasa_exito)
            },
            fallos_por_paso: fallosPorPaso,
            por_totem: porTotem
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener historial detallado de interacciones
exports.getHistorial = async (req, res) => {
    try {
        const { totem_id, exitosa, fecha_inicio, fecha_fin, page = 1, limit = 50 } = req.query;
        const where = {};

        if (totem_id) where.totem_id = totem_id;
        if (exitosa !== undefined) where.exitosa = exitosa === 'true';

        if (fecha_inicio && fecha_fin) {
            where.createdAt = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        } else if (fecha_inicio) {
            where.createdAt = { [Op.gte]: new Date(fecha_inicio) };
        } else if (fecha_fin) {
            where.createdAt = { [Op.lte]: new Date(fecha_fin) };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: interacciones } = await InteraccionTotem.findAndCountAll({
            where,
            include: [{
                model: Totem,
                as: 'totem',
                attributes: ['identificador', 'direccion']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            total: count,
            pagina: parseInt(page),
            por_pagina: parseInt(limit),
            total_paginas: Math.ceil(count / parseInt(limit)),
            interacciones
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
