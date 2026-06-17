exports.receiveMetrics = (req, res) => {
    // 2. Respuesta Rápida: Retorna status 200 de inmediato
    res.status(200).json({ status: "success" });

    // Procesamos la lógica de validación y alertas de forma asíncrona
    setImmediate(async () => {
        try {
            const payload = req.body;
            const { Totem } = require('../models');
            const { Op } = require('sequelize');

            // 1. Priorizamos el ID extraído de forma segura desde la base de datos (vía API Key)
            // 2. Si es una key global (PLATAFORMA), confiamos en el totem_id (puede ser el string 'T-001' o el entero 1) que viene en el payload.
            const rawTotemId = (req.user && req.user.id) ? req.user.id : payload.totem_id;

            if (!rawTotemId) {
                console.error('[Metrics] Error: No se pudo identificar a qué tótem pertenece la métrica.');
                return;
            }

            // Construimos una condición flexible para buscar por ID (entero) o por Identificador (string)
            const whereCondition = {
                [Op.or]: [
                    { identificador: String(rawTotemId) }
                ]
            };
            if (!isNaN(parseInt(rawTotemId))) {
                whereCondition[Op.or].push({ id: parseInt(rawTotemId) });
            }

            // Manejo especial cuando el monitor local falla
            if (payload.error_critico) {
                console.error(`[ALERTA CRÍTICA] Tótem ${rawTotemId} reportó falla del monitor local:`, payload.error_critico);
                await Totem.update(
                    { 
                        ultimo_error_critico: payload.error_critico,
                        is_online: true,
                        last_ping: new Date()
                    },
                    { where: whereCondition }
                );
                return;
            }

            // Validación básica del Payload normal
            if (!payload || !payload.hardware || !payload.perifericos || !payload.servicios_locales) {
                console.error('[Metrics] Error: Payload inválido o incompleto', payload);
                return;
            }

            // Actualizamos la telemetría en la base de datos
            await Totem.update(
                { 
                    ultima_telemetria: payload,
                    ultimo_error_critico: null, // Limpiamos errores anteriores si ahora responde bien
                    is_online: true,
                    last_ping: new Date()
                },
                { where: whereCondition }
            );

            const { totem_id, hardware, perifericos, servicios_locales } = payload;

            // Lógica de Alertas
            if (hardware.cpu_temperature_celsius > 75) {
                console.error(`[ALERTA CRÍTICA] Tótem ${totem_id || 'Desconocido'} - Temperatura de CPU muy alta: ${hardware.cpu_temperature_celsius}°C`);
            }

            if (perifericos.printer_connected === false) {
                console.error(`[ALERTA CRÍTICA] Tótem ${totem_id || 'Desconocido'} - Impresora desconectada`);
            }

            if (servicios_locales.anydesk_running === false || servicios_locales.kiosk_app_running === false) {
                console.error(`[ALERTA CRÍTICA] Tótem ${totem_id || 'Desconocido'} - Servicios locales caídos (Anydesk: ${servicios_locales.anydesk_running}, KioskApp: ${servicios_locales.kiosk_app_running})`);
            }

        } catch (error) {
            console.error('[Metrics] Error procesando la telemetría:', error.message);
        }
    });
};

exports.getAllMetrics = async (req, res) => {
    try {
        const { Totem } = require('../models');
        const totems = await Totem.findAll({
            attributes: ['id', 'identificador', 'direccion', 'status', 'is_online', 'last_ping', 'ultima_telemetria', 'ultimo_error_critico']
        });
        
        res.status(200).json(totems);
    } catch (error) {
        console.error('[Metrics] Error obteniendo métricas:', error);
        res.status(500).json({ message: 'Error interno obteniendo métricas de los tótems' });
    }
};
