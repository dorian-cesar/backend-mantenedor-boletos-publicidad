exports.receiveMetrics = (req, res) => {
    // 2. Respuesta Rápida: Retorna status 200 de inmediato
    res.status(200).json({ status: "success" });

    // Procesamos la lógica de validación y alertas de forma asíncrona
    setImmediate(async () => {
        try {
            const payload = req.body;
            const { Totem } = require('../models');

            // Buscamos el Tótem para actualizarlo (si totem_id no viene en el body pero estamos 
            // usando el apiKeyAuth global, estaría en req.user.id. Asumiremos payload.totem_id o req.user.id)
            const totemIdToUpdate = payload.totem_id || (req.user ? req.user.id : null);

            // Manejo especial cuando el monitor local falla
            if (payload.error_critico) {
                console.error(`[ALERTA CRÍTICA] Tótem ${totemIdToUpdate || 'Desconocido'} reportó falla del monitor local:`, payload.error_critico);
                if (totemIdToUpdate) {
                    await Totem.update(
                        { 
                            ultimo_error_critico: payload.error_critico,
                            is_online: true,
                            last_ping: new Date()
                        },
                        { where: { id: totemIdToUpdate } }
                    );
                }
                return;
            }

            // Validación básica del Payload normal
            if (!payload || !payload.hardware || !payload.perifericos || !payload.servicios_locales) {
                console.error('[Metrics] Error: Payload inválido o incompleto', payload);
                return;
            }

            // Actualizamos la telemetría en la base de datos
            if (totemIdToUpdate) {
                await Totem.update(
                    { 
                        ultima_telemetria: payload,
                        ultimo_error_critico: null, // Limpiamos errores anteriores si ahora responde bien
                        is_online: true,
                        last_ping: new Date()
                    },
                    { where: { id: totemIdToUpdate } }
                );
            }

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
