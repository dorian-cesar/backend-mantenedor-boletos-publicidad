const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Empresa = require('./Empresa');

const Video = sequelize.define('Video', {
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
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Empresa,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'videos',
    paranoid: true
});

Empresa.hasMany(Video, { foreignKey: 'empresa_id', onDelete: 'NO ACTION' });
Video.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'NO ACTION' });

module.exports = Video;
