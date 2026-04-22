const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipo: {
        type: DataTypes.ENUM('PLATAFORMA', 'TOTEM'),
        allowNull: false,
        defaultValue: 'PLATAFORMA'
    },
    totem_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'totems',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'api_keys',
    timestamps: true,
    paranoid: true
});

module.exports = ApiKey;
