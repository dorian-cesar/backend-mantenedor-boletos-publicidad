const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Totem = sequelize.define('Totem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    identificador: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    latitud: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    longitud: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_online: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ultimo_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'totems',
    paranoid: true
});

module.exports = Totem;
