const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

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

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

startServer();
