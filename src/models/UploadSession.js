const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UploadSession = sequelize.define('UploadSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    original_filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_size: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: 'Tamaño total del archivo en bytes'
    },
    chunk_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2 * 1024 * 1024, // 2MB
        comment: 'Tamaño de cada chunk en bytes'
    },
    total_chunks: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    received_chunks: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array de índices de chunks recibidos'
    },
    status: {
        type: DataTypes.ENUM('pending', 'uploading', 'assembling', 'completed', 'failed', 'expired'),
        defaultValue: 'pending'
    },
    empresa_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre para el video (metadata)'
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que inició el upload'
    },
    video_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Referencia al Video creado al completar'
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha de expiración automática'
    }
}, {
    tableName: 'upload_sessions',
    paranoid: false
});

module.exports = UploadSession;
