const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

/**
 * Enviar mensaje de texto simple a WhatsApp
 */
const sendTextMessage = async (to, text) => {
    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: text }
            },
            {
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error enviando mensaje de WhatsApp:', error.response ? error.response.data : error.message);
        throw error;
    }
};

/**
 * Enviar menú con botones interactivos a WhatsApp
 */
const sendInteractiveButtons = async (to, text, buttons) => {
    try {
        const formattedButtons = buttons.map(btn => ({
            type: 'reply',
            reply: {
                id: btn.id,
                title: btn.title
            }
        }));

        const response = await axios.post(
            `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: { text: text },
                    action: { buttons: formattedButtons }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error enviando botones de WhatsApp:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = {
    sendTextMessage,
    sendInteractiveButtons
};
