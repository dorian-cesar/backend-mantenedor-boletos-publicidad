const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empresa = sequelize.define('Empresa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'empresas',
    paranoid: true // Soft delete
});

module.exports = Empresa;
