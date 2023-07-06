const { response } = require("express");
const { WebhookClient } = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();

const {
    comprobarUsuario,
    funcionalidadesUsuario,
    aceptarFuncionalidades,
    autenticarUsuario,
    autenticarUsuarioWeb
} = require('../chatbot/comprobar_usuario');

const {
    comprobarMostrarMenu,
    comprobarMostrarMenuFecha,
    comprobarMostrarMenuFechaPerfil,
    comprobarMostrarMenuPerfil
} = require('../chatbot/mostrar_menu.js');

const {
    comprobarDescargarSeguimiento,
    comprobarDescargarSeguimientoPerfil,
    comprobarDescargarSeguimientoPerfilSeccion
} = require('../chatbot/mostrar_seguimiento');

const {
    comprobarFaltaPerfil,
    comprobarFaltaComida,
    comprobarFaltaFecha,
    comprobarDatosPlato,
    comprobarPlatoACambiar,
    cambiarPlatoMenu
} = require('../chatbot/cambiar_plato');

const {
    registrarPesoYAltura,
    comprobarRegistroPesoPerfil,
    comprobarRegistroPesoPeso,
    comprobarRegistroPesoAltura,
    comprobarRegistroPesoFecha
} = require('../chatbot/registrar_peso');

const {
    comprobarCrearRecompensa,
    comprobarCrearRecompensaPerfil,
    comprobarCrearRecompensaPerfilRecompensa,
    comprobarCrearRecompensaPerfilRecompensaPuntos
} = require('../chatbot/crear_recompensa');

const chatbot = (req, res = response) => {

    const agent = new WebhookClient({ request: req, response: res });
    let intentMap = new Map();

    intentMap.set('nutri.func.funcionalidadesUsuario', funcionalidadesUsuario);
    intentMap.set('nutri.func.funcionalidadesUsuario - yes', aceptarFuncionalidades);

    intentMap.set('nutri.func.usuario', comprobarUsuario);
    intentMap.set('nutri.func.usuario - autenticar', autenticarUsuario);
    intentMap.set('nutri.func.autenticar_usuario_web', autenticarUsuarioWeb);

    // Mostrar Menu de Seguimiento
    intentMap.set('nutri.func.mostrar_menu', comprobarMostrarMenu);
    intentMap.set('nutri.func.mostrar_menu - falta_fecha', comprobarMostrarMenuFecha);
    intentMap.set('nutri.func.mostrar_menu - falta_fecha - falta_perfil', comprobarMostrarMenuFechaPerfil);
    intentMap.set('nutri.func.mostrar_menu - falta_perfil', comprobarMostrarMenuPerfil);

    // Devolver PDF del seguimiento (resumen, comidas, peso-altura)
    intentMap.set('nutri.func.seguimiento', comprobarDescargarSeguimiento);
    intentMap.set('nutri.func.seguimiento - perfil', comprobarDescargarSeguimientoPerfil);
    intentMap.set('nutri.func.seguimiento - perfil - seccion', comprobarDescargarSeguimientoPerfilSeccion);

    // Cambiar un plato por otro en el menu
    intentMap.set('nutri.func.falta_todo', comprobarFaltaPerfil);
    intentMap.set('nutri.func.falta_todo - comidas', comprobarFaltaComida);
    intentMap.set('nutri.func.falta_todo - comidas - fecha', comprobarFaltaFecha);

    intentMap.set('nutri.func.cambiar_plato', comprobarDatosPlato);
    intentMap.set('nutri.func.cambiar_plato - plato_a_cambiar', comprobarPlatoACambiar);
    intentMap.set('nutri.func.cambiar_plato - buscar_plato_nuevo', cambiarPlatoMenu);
    intentMap.set('nutri.func.cambiar_plato - buscar_plato_nuevo - varios_platos', cambiarPlatoMenu);

    // Registro de peso y altura
    intentMap.set('nutri.func.registrar_peso', registrarPesoYAltura);
    intentMap.set('nutri.func.registrar_peso - perfil', comprobarRegistroPesoPerfil);
    intentMap.set('nutri.func.registrar_peso - perfil - peso', comprobarRegistroPesoPeso);
    intentMap.set('nutri.func.registrar_peso - perfil - peso - altura', comprobarRegistroPesoAltura);
    intentMap.set('nutri.func.registrar_peso - perfil - peso - altura - fecha', comprobarRegistroPesoFecha);

    // Crear recompensa
    intentMap.set('nutri.func.crear_recompensa', comprobarCrearRecompensa);
    intentMap.set('nutri.func.crear_recompensa - perfil', comprobarCrearRecompensaPerfil);
    intentMap.set('nutri.func.crear_recompensa - perfil - recompensa', comprobarCrearRecompensaPerfilRecompensa);
    intentMap.set('nutri.func.crear_recompensa - perfil - recompensa - puntos', comprobarCrearRecompensaPerfilRecompensaPuntos);

    agent.handleRequest(intentMap);
}

const respuestaDialogflow = async(req, res = response) => {
    try {
        const { sessionId, queryInput } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                ok: false,
                msg: "La sessionId es obligatoria",
            });
        }

        // Autenticacion Google
        const project_id = process.env.DIALOGFLOW_PROJECT_ID;
        const sessionClient = new dialogflow.SessionsClient({
            credentials: {
                client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
                private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n')
            }
        });

        const sessionPath = sessionClient.projectAgentSessionPath(project_id, sessionId);

        const request = {
            session: sessionPath,
            queryInput
        };

        // Este intent debería lanzarse solo para autenticar al usuario desde el service chat.service
        if (queryInput.text.text == 'autenticar_usuario_web') {
            const { parameters } = req.body;

            if (!parameters) {
                return res.status(400).json({
                    ok: false,
                    msg: "No existen parametros en la request"
                });
            }

            request.queryParams = {
                contexts: [{
                    name: `projects/${project_id}/agent/sessions/${sessionId}/contexts/autenticar_web`,
                    lifespanCount: 1,
                    parameters: {
                        fields: {
                            token: {
                                kind: "stringValue",
                                stringValue: parameters.token
                            }
                        }
                    }
                }]
            }
        }

        // Envia la request
        const responses = await sessionClient.detectIntent(request);

        // La respuesta a devolver
        const respuesta = {}
        const fulfillmentMessages = responses[0].queryResult.fulfillmentMessages;
        const cards = [];

        for (let i = 0; i < fulfillmentMessages.length; i++) {
            if (fulfillmentMessages[i].message == 'text') {
                respuesta.text = fulfillmentMessages[i].text.text[0];
            }
            if (fulfillmentMessages[i].message == 'quickReplies') {
                respuesta.quickReplies = fulfillmentMessages[i].quickReplies.quickReplies;
            }
            if (fulfillmentMessages[i].message == 'card') {
                cards.push(fulfillmentMessages[i].card);
            }
        }

        if (cards.length != 0) respuesta.cards = cards;

        res.json({
            ok: true,
            msg: 'respuestaDialogflow',
            respuesta
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: "respuestaDialogflow"
        });
    }

}


module.exports = {
    chatbot,
    respuestaDialogflow
};