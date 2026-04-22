const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Totem = require('./Totem');
const Video = require('./Video');

const TotemVideo = sequelize.define('TotemVideo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    totem_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Totem,
            key: 'id'
        }
    },
    video_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Video,
            key: 'id'
        }
    },
    orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'totem_videos',
    timestamps: false
});

Totem.belongsToMany(Video, { through: TotemVideo, foreignKey: 'totem_id', as: 'videos', onDelete: 'NO ACTION' });
Video.belongsToMany(Totem, { through: TotemVideo, foreignKey: 'video_id', as: 'totems', onDelete: 'NO ACTION' });

module.exports = TotemVideo;
