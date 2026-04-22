const sequelize = require('./src/config/database');

async function describeTable() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query('DESCRIBE usuarios');
        console.log('Table usuarios structure:', results);
        process.exit(0);
    } catch (error) {
        console.error('Error describing table:', error.message);
        process.exit(1);
    }
}

describeTable();
