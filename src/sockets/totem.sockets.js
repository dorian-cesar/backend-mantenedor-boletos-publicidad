const { Totem, ApiKey } = require('../models');
const { Op } = require('sequelize');

function initTotemSockets(io) {
    // Middleware de autenticación para WebSockets
    io.use(async (socket, next) => {
        try {
            const tokenOrKey = socket.handshake.auth?.token || socket.handshake.headers['x-api-key'];

            if (!tokenOrKey) {
                return next(new Error('Authentication error: Missing token or x-api-key'));
            }

            // 1. Intentar validar como API Key
            const keyFound = await ApiKey.findOne({ 
                where: { key: tokenOrKey, status: true }
            });

            if (keyFound) {
                socket.user = {
                    id: keyFound.totem_id || null,
                    tipo: keyFound.tipo
                };
                return next();
            }

            // 2. Si no es un API Key, intentar validar como JWT (como lo hacía /ping)
            const jwt = require('jsonwebtoken');
            try {
                // Si el token viene con el prefijo "Bearer ", lo limpiamos
                const cleanToken = tokenOrKey.replace(/^Bearer\s+/, "");
                const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
                
                socket.user = {
                    id: decoded.id,
                    tipo: decoded.tipo || decoded.rol
                };
                return next();
            } catch (jwtError) {
                return next(new Error('Authentication error: Invalid Token or API Key'));
            }
        } catch (error) {
            console.error('[Sockets] Error autenticando conexión:', error);
            next(new Error('Internal Server Error'));
        }
    });

    io.on('connection', async (socket) => {
        const rawTotemId = socket.user.id;

        if (rawTotemId) {
            console.log(`[Sockets] Tótem ID ${rawTotemId} conectado (Socket ID: ${socket.id})`);
            
            // Marcar como online apenas se conecta
            try {
                await Totem.update(
                    { is_online: true, last_ping: new Date() },
                    { where: { id: rawTotemId } }
                );
                // Retransmitir a los administradores
                io.to('room:admins').emit('admin:totem_online', { totemId: rawTotemId });
            } catch (error) {
                console.error(`[Sockets] Error marcando tótem ${rawTotemId} como online:`, error);
            }
        } else {
            console.log(`[Sockets] Cliente ${socket.user.tipo || 'PLATAFORMA'} conectado (Socket ID: ${socket.id})`);
            if (socket.user.tipo === 'ADMIN') {
                socket.join('room:admins');
                console.log(`[Sockets] ADMIN unido a la sala room:admins`);
                
                // Enviar la lista inicial de todos los tótems al administrador recién conectado
                try {
                    const totems = await Totem.findAll({
                        attributes: ['id', 'identificador', 'direccion', 'status', 'is_online', 'last_ping', 'ultima_telemetria', 'ultimo_error_critico']
                    });
                    socket.emit('admin:initial_metrics', totems);
                } catch (error) {
                    console.error('[Sockets] Error obteniendo métricas iniciales para ADMIN:', error);
                }
            }
        }

        // Manejar desconexión
        socket.on('disconnect', async () => {
            console.log(`[Sockets] Cliente desconectado (Socket ID: ${socket.id})`);
            if (rawTotemId) {
                try {
                    await Totem.update(
                        { is_online: false, last_ping: new Date() },
                        { where: { id: rawTotemId } }
                    );
                    io.to('room:admins').emit('admin:totem_offline', { totemId: rawTotemId });
                } catch (error) {
                    console.error(`[Sockets] Error marcando tótem ${rawTotemId} como offline:`, error);
                }
            }
        });

        // Evento para recibir la telemetría (métricas) en tiempo real
        socket.on('totem:metrics', async (payload) => {
            if (!payload) return;
            
            try {
                const effectiveTotemId = rawTotemId || payload.totem_id;
                
                if (!effectiveTotemId) return;

                const whereCondition = {
                    [Op.or]: [
                        { identificador: String(effectiveTotemId) }
                    ]
                };
                if (!isNaN(parseInt(effectiveTotemId))) {
                    whereCondition[Op.or].push({ id: parseInt(effectiveTotemId) });
                }

                // Manejo especial cuando el monitor local falla
                if (payload.error_critico) {
                    console.error(`[ALERTA CRÍTICA Sockets] Tótem ${effectiveTotemId} reportó falla del monitor local:`, payload.error_critico);
                    await Totem.update(
                        { 
                            ultimo_error_critico: payload.error_critico,
                            is_online: true,
                            last_ping: new Date()
                        },
                        { where: whereCondition }
                    );
                    
                    io.to('room:admins').emit('admin:metrics_updated', {
                        totemId: effectiveTotemId,
                        metrics: payload
                    });
                    
                    return;
                }

                // Validación básica del Payload normal
                if (!payload.hardware || !payload.perifericos || !payload.servicios_locales) {
                    return;
                }

                // Actualizamos la telemetría
                await Totem.update(
                    { 
                        ultima_telemetria: payload,
                        ultimo_error_critico: null,
                        is_online: true,
                        last_ping: new Date()
                    },
                    { where: whereCondition }
                );

                // Retransmitir al Panel Mantenedor en vivo
                io.to('room:admins').emit('admin:metrics_updated', {
                    totemId: effectiveTotemId,
                    metrics: payload
                });

                const { hardware, perifericos, servicios_locales } = payload;

                // Lógica de Alertas en Consola (como existía en HTTP)
                if (hardware.cpu_temperature_celsius > 75) {
                    console.error(`[ALERTA CRÍTICA Sockets] Tótem ${effectiveTotemId} - Temperatura de CPU muy alta: ${hardware.cpu_temperature_celsius}°C`);
                }

                if (perifericos.printer_connected === false) {
                    console.error(`[ALERTA CRÍTICA Sockets] Tótem ${effectiveTotemId} - Impresora desconectada`);
                }

                if (servicios_locales.anydesk_running === false || servicios_locales.kiosk_app_running === false) {
                    console.error(`[ALERTA CRÍTICA Sockets] Tótem ${effectiveTotemId} - Servicios locales caídos`);
                }

            } catch (error) {
                console.error('[Sockets] Error procesando telemetría:', error.message);
            }
        });
    });
}

module.exports = { initTotemSockets };
