const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

// El puerto se usará directamente desde process.env

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        
        // Sincronizar modelos (solo para desarrollo)
        await sequelize.sync();
        console.log('Modelos sincronizados correctamente.');

        // Seeding de Roles iniciales
        const Rol = require('./models/Rol');
        const roles = ['ADMIN', 'USER'];
        for (const nombre of roles) {
            await Rol.findOrCreate({ where: { nombre } });
        }
        console.log('Roles inicializados.');

        app.listen(process.env.PORT || 3000, () => {
            console.log(`Servidor corriendo en el puerto ${process.env.PORT || 3000}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();
