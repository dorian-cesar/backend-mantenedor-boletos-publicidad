const { Op } = require('sequelize');
const Totem = require('../models/Totem');

const OFFLINE_THRESHOLD_MINUTES = 10;
const CHECK_INTERVAL_MS = 60 * 1000; // 1 minuto

/**
 * Inicia el monitor que verifica los latidos (pings) de los tótems.
 * Si un tótem no ha enviado un ping en más de OFFLINE_THRESHOLD_MINUTES,
 * se considera desconectado y se actualiza su estado.
 */
function startTotemMonitor() {
    console.log(`[TotemMonitor] Iniciando monitor de tótems (intervalo: ${CHECK_INTERVAL_MS}ms, límite: ${OFFLINE_THRESHOLD_MINUTES}m)`);

    setInterval(async () => {
        try {
            const cutoffTime = new Date(Date.now() - OFFLINE_THRESHOLD_MINUTES * 60 * 1000);

            // Buscar tótems que están marcados como online pero cuyo último ping (o último login) es más antiguo que el límite
            const totemsDesconectados = await Totem.findAll({
                where: {
                    is_online: true,
                    [Op.or]: [
                        {
                            last_ping: {
                                [Op.lt]: cutoffTime
                            }
                        },
                        {
                            // Si nunca hizo ping pero tiene un login viejo
                            last_ping: null,
                            ultimo_login: {
                                [Op.lt]: cutoffTime
                            }
                        }
                    ]
                }
            });

            if (totemsDesconectados.length > 0) {
                console.log(`[TotemMonitor] Se detectaron ${totemsDesconectados.length} tótems inactivos. Marcando como offline...`);
                
                for (const totem of totemsDesconectados) {
                    await totem.update({ is_online: false });
                    console.log(`[TotemMonitor] Tótem ${totem.identificador} (ID: ${totem.id}) marcado como offline.`);
                }
            }
        } catch (error) {
            console.error('[TotemMonitor] Error al verificar el estado de los tótems:', error);
        }
    }, CHECK_INTERVAL_MS);
}

module.exports = { startTotemMonitor };
