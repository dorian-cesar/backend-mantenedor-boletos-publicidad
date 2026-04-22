const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Empresa = require('./Empresa');
const Video = require('./Video');
const Totem = require('./Totem');
const TotemVideo = require('./TotemVideo');
const ApiKey = require('./ApiKey');

// Las asociaciones ya están definidas dentro de los archivos de los modelos,
// pero para asegurarnos de que se carguen todas, las importamos aquí.
// Sin embargo, es mejor centralizarlas aquí para evitar problemas de dependencia circular.

module.exports = {
    Rol,
    Usuario,
    Empresa,
    Video,
    Totem,
    TotemVideo
};
