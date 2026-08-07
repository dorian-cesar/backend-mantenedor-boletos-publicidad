require('dotenv').config();
const { Usuario, Rol } = require('./src/models');
const sequelize = require('./src/config/database');

async function seedFinanzasUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Asegurar que el rol existe
        const [rolFinanzas] = await Rol.findOrCreate({ where: { nombre: 'FINANZAS' } });

        // Verificar si existe el usuario
        const email = 'finanzas@test.com';
        let usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            usuario = await Usuario.create({
                nombre: 'Usuario Finanzas',
                email: email,
                password: 'password123', // Será hasheada por el hook del modelo
                rol_id: rolFinanzas.id,
                status: true
            });
            console.log(`Usuario creado exitosamente: ${email} / password123`);
        } else {
            console.log(`El usuario ${email} ya existe. Asignando rol FINANZAS si no lo tiene...`);
            usuario.rol_id = rolFinanzas.id;
            await usuario.save();
            console.log('Rol de usuario actualizado a FINANZAS.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedFinanzasUser();
