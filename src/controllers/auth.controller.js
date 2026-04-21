const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nombre, email, password, rol_id } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado' });

        const usuario = await Usuario.create({
            nombre,
            email,
            password,
            rol_id: rol_id || 2 // Por defecto USER si no se especifica
        });

        res.status(201).json({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ 
            where: { email, status: true },
            include: [{ model: Rol, as: 'rol' }]
        });

        if (!usuario || !(await usuario.comparePassword(password))) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol.nombre },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol.nombre
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
