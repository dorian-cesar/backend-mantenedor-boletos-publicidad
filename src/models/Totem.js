const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Totem = sequelize.define('Totem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'totems',
    paranoid: true
});

module.exports = Totem;
