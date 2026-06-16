exports.receiveMetrics = (req, res) => {
    // 2. Respuesta Rápida: Retorna status 200 de inmediato
    res.status(200).json({ status: "success" });

    // Procesamos la lógica de validación y alertas de forma asíncrona
    setImmediate(() => {
        try {
            const payload = req.body;

            // Manejo especial cuando el monitor local falla
            if (payload.error_critico) {
                console.error(`[ALERTA CRÍTICA] Tótem ${payload.totem_id || 'Desconocido'} reportó falla del monitor local:`, payload.error_critico);
                return;
            }

            // Validación básica del Payload normal
            if (!payload || !payload.hardware || !payload.perifericos || !payload.servicios_locales) {
                console.error('[Metrics] Error: Payload inválido o incompleto', payload);
                return;
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
