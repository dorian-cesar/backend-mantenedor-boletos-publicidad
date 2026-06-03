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

        // Iniciar monitor de tótems (latidos)
        const { startTotemMonitor } = require('./utils/totemMonitor');
        startTotemMonitor();

        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor corriendo en el puerto ${process.env.PORT || 3000}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

// Iniciar el servidor
startServer().then(() => {
    // El servidor ya está escuchando dentro de startServer
    // Mantenemos el proceso vivo explícitamente si es necesario (aunque app.listen debería bastar)
    setInterval(() => {}, 1000000); 
});
