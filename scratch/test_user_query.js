const { Usuario } = require('./src/models');

async function testQuery() {
    try {
        const count = await Usuario.count();
        console.log('Total users:', count);
        process.exit(0);
    } catch (error) {
        console.error('Query failed:', error);
        process.exit(1);
    }
}

testQuery();
