const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Empresa = require('./Empresa');
const Video = require('./Video');
const Totem = require('./Totem');
const TotemVideo = require('./TotemVideo');
const ApiKey = require('./ApiKey');
const VentaBoleto = require('./VentaBoleto');

// Las asociaciones ya están definidas dentro de los archivos de los modelos,
// pero para asegurarnos de que se carguen todas, las importamos aquí.
// Relaciones para ApiKey
Totem.hasMany(ApiKey, { foreignKey: 'totem_id', as: 'apiKeys', onDelete: 'NO ACTION' });
ApiKey.belongsTo(Totem, { foreignKey: 'totem_id', as: 'totem', onDelete: 'NO ACTION' });

// Relaciones para VentaBoleto
Totem.hasMany(VentaBoleto, { foreignKey: 'totem_id', as: 'ventas', onDelete: 'NO ACTION' });
VentaBoleto.belongsTo(Totem, { foreignKey: 'totem_id', as: 'totem', onDelete: 'NO ACTION' });

module.exports = {
    Rol,
    Usuario,
    Empresa,
    Video,
    Totem,
    TotemVideo,
    ApiKey,
    VentaBoleto
};
