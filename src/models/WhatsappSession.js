const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WhatsappSession = sequelize.define('WhatsappSession', {
    phone_number: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    current_step: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'INICIO'
    },
    context_data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    last_interaction: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'whatsapp_sessions',
    timestamps: true
});

module.exports = WhatsappSession;
