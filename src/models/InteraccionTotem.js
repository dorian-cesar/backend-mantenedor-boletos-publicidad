const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InteraccionTotem = sequelize.define('InteraccionTotem', {
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
    exitosa: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    venta_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'ventas_boletos',
            key: 'id'
        },
        comment: 'FK a la venta asociada (solo si la interacción fue exitosa)'
    },
    paso_alcanzado: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Último paso alcanzado en la interacción (ej: inicio, seleccion_servicio, seleccion_numeros, pago, impresion, completado)'
    },
    pasos_completados: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array con todos los pasos que completó el usuario en orden cronológico'
    },
    motivo_fallo: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Razón del fallo (ej: timeout_inactividad, error_pago, cancelado_usuario, error_impresion)'
    },
    duracion_segundos: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duración total de la interacción en segundos'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Datos adicionales de la interacción'
    }
}, {
    tableName: 'interacciones_totem',
    paranoid: true,
    timestamps: true
});

module.exports = InteraccionTotem;
