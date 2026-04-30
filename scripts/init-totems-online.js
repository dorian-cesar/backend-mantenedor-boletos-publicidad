require('dotenv').config();
const { Totem } = require('../src/models');
const sequelize = require('../src/config/database');

async function initializeTotemsStatus() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida para inicialización de tótems...');

        // Actualizamos todos los tótems que tengan is_online como NULL o que simplemente queramos resetear a false
        const [updatedCount] = await Totem.update(
            { is_online: false },
            { 
                where: {
                    // Actualiza todos los registros
                }
            }
        );

        console.log(`¡Éxito! Se han actualizado ${updatedCount} tótems al estado offline (false).`);
        process.exit(0);
    } catch (error) {
        console.error('Error al inicializar tótems:', error);
        process.exit(1);
    }
}

initializeTotemsStatus();
