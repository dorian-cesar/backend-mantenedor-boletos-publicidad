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
    pais: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'CL',
        comment: 'País donde se realizó la compra (ej: CL, PY, PE)'
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    datos_pasajero: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Almacena nombre, documento, email, telefono, etc. del pasajero'
    },
    datos_boleto: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Almacena origen, destino, fecha, asiento, etc. del boleto'
    },
    datos_bancarios: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Almacena banco, beneficiario, tipo y numero de documento, numero de cuenta, etc.'
    },
    porcentaje_devolucion: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Porcentaje aprobado a devolver (ej: 80.00, 100.00)'
    },
    resolucion_descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Justificación o nota agregada por Finanzas al aprobar/rechazar'
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
