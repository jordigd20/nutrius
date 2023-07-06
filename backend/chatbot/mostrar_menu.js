const { Card, Suggestion } = require('dialogflow-fulfillment');
const { obtenerMenuChatbot } = require('../controllers/menu_perfil');
const Usuario = require('../models/usuarios');
const Perfil = require('../models/perfiles');
const { obtenerUsuarioChatbot } = require('../controllers/usuarios');


const comprobarMostrarMenu = async(agent) => {
    const { person: { name: perfil } } = agent.parameters; // Nombre del perfil
    const paramFecha = agent.parameters['date-time'];

    try {

        if (paramFecha === '' || paramFecha.endDateTime !== undefined) {
            // Si no se dijo la fecha pero si el perfil, paso el perfil por contexto
            if (perfil) {
                agent.context.set('nutrifuncmostrar_menu-followup', 5, { 'perfil': perfil });
            }

            return agent.add([
                '¿De qué día quieres ver el menú?',
                new Suggestion('Lunes'),
                new Suggestion('Martes'),
                new Suggestion('Miercoles'),
                new Suggestion('Jueves'),
                new Suggestion('Viernes'),
                new Suggestion('Sabado'),
                new Suggestion('Domingo'),
            ]);
        }

        if (!perfil) {
            // Si no se dijo el perfil pero si la fecha, paso la fecha por contexto
            if (paramFecha !== '') {
                agent.context.set('nutrifuncmostrar_menu-followup', 5, { 'fecha': paramFecha });
            }
            const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;
            const usuario = await obtenerUsuarioChatbot({ uid });

            const respuesta = ['¿Cuál de tus perfiles quieres usar?'];
            usuario.perfiles.forEach(perfil => {
                respuesta.push(new Suggestion(perfil.nombre));
            });

            return agent.add(respuesta);
        }

        agent.context.delete('nutrifuncmostrar_menu-followup');
        const menu = await mostrarMenu(agent, paramFecha, perfil);

        const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaABuscar = diaSemana[new Date(paramFecha).getDay()];
        agent.add(`Aqui tienes el menu del ${diaABuscar}`);
        agent.add(menu);
    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifuncmostrar_menu-followup');
        agent.add('Ha ocurrido un error obteniendo el menu, porfavor, vuelve a intentarlo más tarde.');
    }
}

const comprobarMostrarMenuFecha = async(agent) => {
    const paramFecha = agent.parameters['date-time'];
    const { perfil } = agent.contexts.find(context => context.name === 'nutrifuncmostrar_menu-followup').parameters;

    try {
        if (!perfil) {
            // A este punto llego la fecha pero no el perfil, se pregunta por el perfil y se le pasa la fecha por contexto
            agent.context.set('nutrifuncmostrar_menu-falta_fecha-followup', 5, { 'fecha': paramFecha });

            const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;
            const usuario = await obtenerUsuarioChatbot({ uid });

            const respuesta = ['¿Cuál de tus perfiles quieres usar?'];
            usuario.perfiles.forEach(perfil => {
                respuesta.push(new Suggestion(perfil.nombre));
            });

            return agent.add(respuesta);
        }

        agent.context.delete('nutrifuncmostrar_menu-followup');
        agent.context.delete('nutrifuncmostrar_menu-falta_fecha-followup');
        const menu = await mostrarMenu(agent, paramFecha, perfil);

        const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaABuscar = diaSemana[new Date(paramFecha).getDay()];
        agent.add(`Aqui tienes el menu del ${diaABuscar}`);
        agent.add(menu);

    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifuncmostrar_menu-followup');
        agent.context.delete('nutrifuncmostrar_menu-falta_fecha-followup');
        agent.add('Ha ocurrido un error obteniendo el menu, porfavor, vuelve a intentarlo más tarde.');
    }
}


const comprobarMostrarMenuFechaPerfil = async(agent) => {
    try {
        const { fecha: paramFecha } = agent.contexts.find(context => context.name === 'nutrifuncmostrar_menu-falta_fecha-followup').parameters;
        const { person: { name: perfil } } = agent.parameters; // Nombre del perfil

        agent.context.delete('nutrifuncmostrar_menu-followup');
        agent.context.delete('nutrifuncmostrar_menu-falta_fecha-followup');
        const menu = await mostrarMenu(agent, paramFecha, perfil);

        const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaABuscar = diaSemana[new Date(paramFecha).getDay()];
        agent.add(`Aqui tienes el menu del ${diaABuscar}`);
        agent.add(menu);

    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifuncmostrar_menu-followup');
        agent.context.delete('nutrifuncmostrar_menu-falta_fecha-followup');
        agent.add('Ha ocurrido un error obteniendo el menu, porfavor, vuelve a intentarlo más tarde.');
    }
}

const comprobarMostrarMenuPerfil = async(agent) => {
    try {
        const { fecha: paramFecha } = agent.contexts.find(context => context.name === 'nutrifuncmostrar_menu-followup').parameters;
        const { person: { name: perfil } } = agent.parameters; // Nombre del perfil

        agent.context.delete('nutrifuncmostrar_menu-followup');
        const menu = await mostrarMenu(agent, paramFecha, perfil);

        const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaABuscar = diaSemana[new Date(paramFecha).getDay()];
        agent.add(`Aqui tienes el menu del ${diaABuscar}`);
        agent.add(menu);

    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifuncmostrar_menu-followup');
        agent.add('Ha ocurrido un error obteniendo el menu, porfavor, vuelve a intentarlo más tarde.');
    }
}

const mostrarMenu = async(agent, paramFecha, nombrePerfil) => {
    return new Promise(async(resolve, reject) => {
        try {
            const fecha = new Date(paramFecha);
            const fechaABuscar = `${fecha.getDate()}/${fecha.getMonth()}/${fecha.getFullYear()}`;

            // Comprobar que la fechaABuscar es correcta (tiene que pertenecer a la semana actual)

            const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const diaABuscar = diaSemana[fecha.getDay()];

            //Obtener usuario
            const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;
            const usuario = await Usuario.findById(uid);
            // Comprobar que el perfil seleccionado existe en los perfiles del usuario
            let perfil = null;
            let out = false;
            for (let i = 0; i < usuario.perfiles.length && !out; i++) {
                perfil = await Perfil.findById(usuario.perfiles[i]);
                let nombreIgual = new RegExp(perfil.nombre, 'i').test(nombrePerfil);
                if (nombreIgual) {
                    out = true;
                }
            }

            if (!perfil) {
                agent.context.delete('nutrifuncmostrar_menu-followup');
                return agent.add('No he encontrado el perfil que buscas, vuelve a intentarlo.');
            }

            // Quedarse con el id del perfil
            const perfilId = perfil._id.toString();
            const menu = await obtenerMenuChatbot(diaABuscar, perfilId);
            const respuestaCards = [];

            for (let i = 0; i < menu.length; i++) {
                const tituloComida = menu[i][0].charAt(0).toUpperCase() + menu[i][0].slice(1);
                respuestaCards.push(new Card({
                    title: `${tituloComida}: ${menu[i][1].nombre}`,
                    text: `Comidas: ${menu[i][1].comida.join(', ')} --- Intolerancias: ${menu[i][1].intolerancias.join(', ') || 'Ninguna'}`,
                    imageUrl: menu[i][1].imagen,
                }));
            }
            resolve(respuestaCards);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

module.exports = {
    comprobarMostrarMenu,
    comprobarMostrarMenuFecha,
    comprobarMostrarMenuFechaPerfil,
    comprobarMostrarMenuPerfil
};