const fs = require('fs');
const path = require('path');
const Converter = require('openapi-to-postmanv2');
require('dotenv').config();

// Importamos la especificación de Swagger
const swaggerSpec = require('../src/config/swagger');

// Configuración de la conversión
const options = {
    schema: swaggerSpec,
    type: 'json'
};

Converter.convert({ type: 'json', data: swaggerSpec }, {
    folderStrategy: 'Tags',
    includeAuthInfoInExample: true
}, (err, conversionResult) => {
    if (err) {
        console.error('Error durante la conversión:', err);
        return;
    }

    if (!conversionResult.result) {
        console.error('No se pudo convertir el esquema:', conversionResult.reason);
        return;
    }

    const collection = conversionResult.output[0].data;

    // Añadir variable de colección 'token' si no existe
    if (!collection.variable) collection.variable = [];
    if (!collection.variable.find(v => v.key === 'token')) {
        collection.variable.push({
            key: 'token',
            value: '',
            type: 'string'
        });
    }

    // Función recursiva para buscar los endpoints de login y añadirles el script de test
    const addTestScriptToLogins = (items) => {
        items.forEach(item => {
            if (item.item) {
                addTestScriptToLogins(item.item);
            } else if (item.request && (item.name.toLowerCase().includes('login') || item.request.url.path.includes('login'))) {
                item.event = [
                    {
                        listen: "test",
                        script: {
                            exec: [
                                "var jsonData = pm.response.json();",
                                "if (jsonData.token) {",
                                "    pm.collectionVariables.set(\"token\", jsonData.token);",
                                "    console.log(\"Token guardado automáticamente en la variable 'token'\");",
                                "}"
                            ],
                            type: "text/javascript"
                        }
                    }
                ];
            }
        });
    };

    addTestScriptToLogins(collection.item);

    const outputPath = path.join(__dirname, '../postman_collection.json');

    fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
    console.log('¡Colección de Postman generada con éxito con scripts de auto-login!');
});
