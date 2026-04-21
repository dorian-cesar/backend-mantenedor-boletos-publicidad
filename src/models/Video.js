const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Empresa = require('./Empresa');

const Video = sequelize.define('Video', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Empresa,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'videos',
    paranoid: true
});

Empresa.hasMany(Video, { foreignKey: 'empresa_id' });
Video.belongsTo(Empresa, { foreignKey: 'empresa_id' });

module.exports = Video;
