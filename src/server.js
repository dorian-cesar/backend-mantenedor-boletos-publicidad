require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
const fs = require('fs');
const path = require('path');
const { startUploadCleaner } = require('./utils/uploadCleaner');

// El puerto se usará directamente desde process.env

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        
        // Sincronizar modelos (solo para desarrollo/alter: true para auto migración)
        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados correctamente.');

        // Crear directorio de chunks si no existe
        const chunksDir = path.join(__dirname, '../uploads/chunks');
        fs.mkdirSync(chunksDir, { recursive: true });
        console.log('Directorio de chunks verificado.');

        // Seeding de Roles iniciales
        const Rol = require('./models/Rol');
        const roles = ['ADMIN', 'USER', 'TOTEM'];
        for (const nombre of roles) {
            await Rol.findOrCreate({ where: { nombre } });
        }
        console.log('Roles inicializados.');

        // Iniciar limpieza periódica de uploads expirados
        startUploadCleaner();

        // Iniciar monitor de tótems (latidos) (mantener como respaldo)
        const { startTotemMonitor } = require('./utils/totemMonitor');
        startTotemMonitor();

        // Configurar servidor HTTP y WebSockets
        const http = require('http');
        const { Server } = require('socket.io');
        const { initTotemSockets } = require('./sockets/totem.sockets');

        const server = http.createServer(app);

        // DEBUG: Imprimir los headers del upgrade de WebSocket que llegan al servidor Node.js
        server.on('upgrade', (req, socket, head) => {
            console.log('[DEBUG-UPGRADE] method:', req.method, 'url:', req.url);
            console.log('[DEBUG-UPGRADE] headers:', req.headers);
        });
        
        const io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        app.set('io', io);

        // Inicializar lógica de sockets para tótems
        initTotemSockets(io);

        server.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor HTTP y WebSocket corriendo en el puerto ${process.env.PORT || 3000}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

// Iniciar el servidor
startServer().catch(err => console.error(err));
