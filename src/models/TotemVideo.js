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
        type: DataTypes.UUID,
        references: {
            model: Totem,
            key: 'id'
        }
    },
    video_id: {
        type: DataTypes.UUID,
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

Totem.belongsToMany(Video, { through: TotemVideo, foreignKey: 'totem_id', as: 'videos' });
Video.belongsToMany(Totem, { through: TotemVideo, foreignKey: 'video_id', as: 'totems' });

module.exports = TotemVideo;
