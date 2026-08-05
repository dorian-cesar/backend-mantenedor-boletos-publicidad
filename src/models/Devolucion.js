const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Totem = require('./Totem');

const Devolucion = sequelize.define('Devolucion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticket_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    monto: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA'),
        defaultValue: 'PENDIENTE',
        allowNull: false
    },
    origen: {
        type: DataTypes.ENUM('TOTEM', 'WEB'),
        defaultValue: 'WEB',
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    totem_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'totems',
            key: 'id'
        }
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        comment: 'Usuario de Finanzas que gestionó/aprobó la devolución (opcional)'
    },
    fecha_solicitud: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: 'devoluciones',
    timestamps: true,
    paranoid: true
});

module.exports = Devolucion;
