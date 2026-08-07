const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogOperacionBoleto = sequelize.define('LogOperacionBoleto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticket_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    operacion: {
        type: DataTypes.ENUM('DEVOLUCION', 'ANULACION', 'CONSULTA'),
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('EXITO', 'ERROR'),
        allowNull: false
    },
    respuesta_integracion: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON con la respuesta cruda del sistema de reservas'
    },
    mensaje_error: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensaje de error en caso de fallo'
    },
    pais: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'CL',
        comment: 'País de la operación (ej: CL, PY, PE)'
    }
}, {
    tableName: 'logs_operaciones_boletos',
    timestamps: true,
    paranoid: false // Los logs usualmente no se borran suavemente, o se borran o no
});

module.exports = LogOperacionBoleto;
