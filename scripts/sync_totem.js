require('dotenv').config();
const sequelize = require('../src/config/database');
const Totem = require('../src/models/Totem');

async function syncTotem() {
    try {
        await sequelize.authenticate();
        console.log('Autenticado');
        await Totem.sync({ alter: true });
        console.log('Tabla Totem alterada exitosamente con last_ping');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

syncTotem();
