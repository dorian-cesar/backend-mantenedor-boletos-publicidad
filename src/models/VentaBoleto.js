const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VentaBoleto = sequelize.define('VentaBoleto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    totem_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'totems',
            key: 'id'
        }
    },
    payload_request: {
        type: DataTypes.JSON,
        allowNull: false
    },
    payload_response: {
        type: DataTypes.JSON,
        allowNull: false
    },
    ticket_numbers: {
        type: DataTypes.JSON,
        allowNull: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    operation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timestamp_operacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'ventas_boletos',
    paranoid: true,
    timestamps: true
});

module.exports = VentaBoleto;
