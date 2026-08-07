const whatsappService = require('../services/whatsappService');
const { WhatsappSession } = require('../models');

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'boletos_token_123';

/**
 * Verifica el Webhook (Requerido por Meta)
 */
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

/**
 * Recibe y procesa los mensajes entrantes de WhatsApp
 */
const receiveMessage = async (req, res) => {
    try {
        const body = req.body;

        // Validar que sea un evento de WhatsApp API
        if (body.object === 'whatsapp_business_account') {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const phoneNumber = body.entry[0].changes[0].value.messages[0].from;
                const message = body.entry[0].changes[0].value.messages[0];

                // 1. Responder siempre 200 OK inmediatamente para evitar reintentos de Meta
                res.sendStatus(200);

                // 2. Procesar el mensaje de forma asíncrona (StateMachine)
                await processMessageFlow(phoneNumber, message);
                return;
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error en webhook de WhatsApp:', error);
        // Responde 200 para que Meta no se congele si hay un error nuestro
        res.sendStatus(200);
    }
};

/**
 * Máquina de Estados (El flujo del bot)
 */
const processMessageFlow = async (phone, messageData) => {
    // Buscar o crear sesión del usuario
    let [session, created] = await WhatsappSession.findOrCreate({
        where: { phone_number: phone },
        defaults: { current_step: 'INICIO', context_data: {} }
    });

    // Validar expiración (Si pasó más de 30 minutos sin escribir, resetear sesión)
    const now = new Date();
    const diffMinutes = (now - session.last_interaction) / (1000 * 60);
    if (!created && diffMinutes > 30) {
        session.current_step = 'INICIO';
        session.context_data = {};
    }

    // Actualizar timestamp
    session.last_interaction = now;
    await session.save();

    // Extraer texto o respuesta de botón
    let userText = '';
    let buttonId = '';

    if (messageData.type === 'text') {
        userText = messageData.text.body.toLowerCase().trim();
    } else if (messageData.type === 'interactive' && messageData.interactive.type === 'button_reply') {
        buttonId = messageData.interactive.button_reply.id;
    }

    // FLUJO DE ESTADOS
    switch (session.current_step) {
        case 'INICIO':
            await whatsappService.sendInteractiveButtons(phone, '¡Hola! Bienvenido a la Venta de Boletos. ¿Qué deseas hacer?', [
                { id: 'ver_eventos', title: 'Ver Eventos' },
                { id: 'hablar_asesor', title: 'Hablar con asesor' }
            ]);
            session.current_step = 'ESPERANDO_OPCION';
            break;

        case 'ESPERANDO_OPCION':
            if (buttonId === 'ver_eventos' || userText.includes('evento')) {
                // TODO: Aquí llamarías a tu controlador/endpoint real de eventos
                await whatsappService.sendTextMessage(phone, 'Estos son los eventos disponibles (Prueba):\n1. Concierto VIP\n2. Teatro Local');
                session.current_step = 'INICIO'; // Reiniciar por ahora
            } else if (buttonId === 'hablar_asesor') {
                await whatsappService.sendTextMessage(phone, 'En un momento un asesor se contactará contigo.');
                session.current_step = 'INICIO';
            } else {
                await whatsappService.sendTextMessage(phone, 'Por favor, selecciona una opción válida.');
            }
            break;

        default:
            session.current_step = 'INICIO';
            break;
    }

    await session.save();
};

module.exports = {
    verifyWebhook,
    receiveMessage
};
