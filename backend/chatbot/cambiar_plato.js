const { Suggestion, Card } = require('dialogflow-fulfillment');
const { obtenerUsuarioChatbot } = require('../controllers/usuarios');
const {
    comprobarPlatoMenuActualChatbot,
    cambiarPlatoPorOtroChatbot,
    platosMenuActualChatbot
} = require('../controllers/menu_perfil');
const { buscarPlatoChatbot } = require('../controllers/platos');

const comprobarFaltaPerfil = async(agent) => {
    const { person: { name: perfil } } = agent.parameters;
    agent.context.set('falta_todo', 5, { 'perfil': perfil });

    return agent.add([
        '¿De qué comida quieres cambiar el plato?',
        new Suggestion('Desayuno'),
        new Suggestion('Almuerzo'),
        new Suggestion('Comida'),
        new Suggestion('Merienda'),
        new Suggestion('Cena'),
    ]);

}

const comprobarFaltaComida = async(agent) => {
    const { comidas } = agent.contexts.find(context => context.name === 'nutrifuncfalta_todo-followup').parameters;
    const { person: { name: perfil } } = agent.contexts.find(context => context.name === 'falta_todo').parameters;

    agent.context.set('falta_todo', 5, { 'perfil': perfil, 'comidas': comidas });

    return agent.add([
        '¿De qué día quieres cambiar el plato?',
        new Suggestion('Lunes'),
        new Suggestion('Martes'),
        new Suggestion('Miercoles'),
        new Suggestion('Jueves'),
        new Suggestion('Viernes'),
        new Suggestion('Sabado'),
        new Suggestion('Domingo'),
    ]);
}

const comprobarFaltaFecha = async(agent) => {
    const { person: { name: perfilABuscar }, comidas } = agent.contexts.find(context => context.name === 'falta_todo').parameters;
    const paramFecha = agent.parameters['date-time'];
    const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;

    try {
        agent.context.delete('nutrifuncfalta_todo-comidas-followup');
        agent.context.delete('nutrifuncfalta_todo-followup');
        agent.context.delete('falta_todo');

        const fecha = new Date(paramFecha);
        const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaABuscar = diaSemana[fecha.getDay()];

        // Comprobar que la fecha es correcta (tiene que pertenecer a la semana actual)
        const usuario = await obtenerUsuarioChatbot({ uid });
        // Comprobar que el perfil seleccionado existe en los perfiles del usuario
        const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));
        if (!perfilEncontrado) {
            agent.context.delete('nutrifunccambiar_plato-followup');
            return agent.add('No he encontrado el perfil que buscas, vuelve a intentarlo.');
        }

        // Quedarse con el id del perfil
        const perfilId = perfilEncontrado._id.toString();

        const platosEncontrados = await platosMenuActualChatbot(diaABuscar, comidas, perfilId);
        const respuesta = ['Estos son los platos que he encontrado, ¿cuál deseas cambiar?'];
        platosEncontrados.forEach(plato => {
            respuesta.push(new Suggestion(plato));
        });

        agent.context.set('nutrifunccambiar_plato-followup', 5, { 'person': { name: perfilABuscar }, 'comida': comidas, 'date-time': paramFecha, 'perfilId': perfilId });
        return agent.add(respuesta);
    } catch (error) {
        console.error(error);
        return agent.add('Ha ocurrido un error obteniendo los platos, porfavor, vuelve a intentarlo más tarde.');
    }
}

const comprobarDatosPlato = async(agent) => {
    const { person: { name: perfilABuscar }, comida } = agent.parameters;
    const paramFecha = agent.parameters['date-time'];
    const { uid, premium } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;
    const comidas = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'];
    const existeComida = comidas.includes(comida.toLowerCase());

    try {
        // Si el usuario no es premium quitarle el contexto del followup
        if (!premium) {
            agent.context.delete('nutrifunccambiar_plato-followup');
            return agent.add(new Card({
                title: 'Solo los usuarios premium pueden cambiar platos',
                text: 'Si lo deseas puedes contratar nuestros planes premium desde aquí',
                imageUrl: '',
                buttonText: 'Planes premium',
                buttonUrl: agent.requestSource === 'TELEGRAM' ? `https://nutrius.ovh/inicio/premium` : `/inicio/premium`
            }));
        }

        const usuario = await obtenerUsuarioChatbot({ uid });

        if ((paramFecha === '' || paramFecha.endDateTime !== undefined) && !perfilABuscar && !existeComida) {

            const respuesta = ['¿Cuál de tus perfiles quieres usar?'];
            usuario.perfiles.forEach(perfil => {
                respuesta.push(new Suggestion(perfil.nombre));
            });

            agent.context.delete('nutrifunccambiar_plato-followup');
            agent.context.set('falta_todo', 5, {});
            return agent.add(respuesta);

        } else if (paramFecha !== '' && perfilABuscar && existeComida) {
            const fecha = new Date(paramFecha);
            const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const diaABuscar = diaSemana[fecha.getDay()];

            // Comprobar que la fecha es correcta (tiene que pertenecer a la semana actual)

            // Comprobar que el perfil seleccionado existe en los perfiles del usuario
            const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));
            if (!perfilEncontrado) {
                agent.context.delete('nutrifunccambiar_plato-followup');
                return agent.add('No he encontrado el perfil que buscas, vuelve a intentarlo.');
            }

            // Quedarse con el id del perfil
            const perfilId = perfilEncontrado._id.toString();
            agent.context.set('nutrifunccambiar_plato-followup', 5, { 'perfilId': perfilId });

            const platosEncontrados = await platosMenuActualChatbot(diaABuscar, comida, perfilId);
            const respuesta = ['Estos son los platos que he encontrado, ¿cuál deseas cambiar?'];
            platosEncontrados.forEach(plato => {
                respuesta.push(new Suggestion(plato));
            });

            return agent.add(respuesta);
        } else {
            throw new Error('Error en los parametros');
        }

    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifunccambiar_plato-followup');
        return agent.add('Ha ocurrido un error obteniendo los platos, porfavor, vuelve a intentarlo más tarde.');
    }

}

const comprobarPlatoACambiar = async(agent) => {
    const paramsContexto = agent.contexts.find(context => context.name === 'nutrifunccambiar_plato-followup').parameters;
    const { person: { name: perfilABuscar } } = paramsContexto; // nombre del perfil
    const fecha = new Date(paramsContexto['date-time']); // fecha de hoy
    const { comida, plato, perfilId } = paramsContexto; // comida: (desayuno, almuerzo, comida, merienda, cena)
    // plato: (cualquier plato del .csv con los platos de la BD)
    const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;
    const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaABuscar = diaSemana[fecha.getDay()];

    // Buscar los resultados del plato que está buscando el usuario
    try {

        // Comprobar que el plato a cambiar existe en el menu actual
        const platoEncontrado = await comprobarPlatoMenuActualChatbot(diaABuscar, comida, plato, perfilId);

        if (!platoEncontrado.encontrado) {
            agent.context.delete('nutrifunccambiar_plato-plato_a_cambiar-followup');
            return agent.add('No he encontrado ese plato en tu menu, vuelve a intentarlo por favor');
        }

        agent.context.set('nutrifunccambiar_plato-plato_a_cambiar-followup', 5, { 'platoACambiar': platoEncontrado.plato.nombre });
        agent.add(`¿Con que plato quieres substituir a "${platoEncontrado.plato.nombre}"?`);
    } catch (error) {
        console.error(error)
        agent.add('No he podido buscar el plato a cambiar, porfavor, vuelve a intentarlo más tarde.');
    }
}

const cambiarPlatoMenu = async(agent) => {
    const { platoACambiar } = agent.contexts.find(context => context.name === 'nutrifunccambiar_plato-plato_a_cambiar-followup').parameters;
    const paramsContexto = agent.contexts.find(context => context.name === 'nutrifunccambiar_plato-followup').parameters;
    const { person: { name: perfilABuscar } } = paramsContexto; // Nombre del perfil
    const fecha = new Date(paramsContexto['date-time']); // fecha de hoy
    const { comida, perfilId } = paramsContexto; // comida: (desayuno, almuerzo, comida, merienda, cena)
    const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaABuscar = diaSemana[fecha.getDay()];

    try {
        const { plato } = agent.parameters;
        const platosEncontrados = await buscarPlatoChatbot(plato);

        if (platosEncontrados.length === 0) {
            agent.context.delete('nutrifunccambiar_plato-buscar_plato_nuevo-followup');
            return agent.add('No he encontrado ningún plato con ese nombre, vuelve a introducir el plato que buscas por favor.');
        }

        if (platosEncontrados.length > 1) {
            const respuesta = ['He encontrado más de un plato con ese nombre, ¿con cuál quieres quedarte?'];
            platosEncontrados.forEach(plato => {
                respuesta.push(new Suggestion(plato.nombre));
            });
            return agent.add(respuesta);
        }

        const cambiarPlato = await cambiarPlatoPorOtroChatbot(
            diaABuscar,
            comida.toLowerCase(),
            platoACambiar,
            perfilId,
            platosEncontrados[0]._id.toString()
        );

        if (cambiarPlato) {
            agent.context.delete('nutrifunccambiar_plato-buscar_plato_nuevo-followup');
            agent.context.delete('nutrifunccambiar_plato-plato_a_cambiar-followup');
            agent.context.delete('nutrifunccambiar_plato-followup');
            agent.add('El plato se ha cambiado correctamente');
        }

    } catch (error) {
        console.error(error);
        agent.add('No he podido buscar los resultados del plato, porfavor, vuelve a intentarlo más tarde.');
    }

}

module.exports = {
    comprobarFaltaPerfil,
    comprobarFaltaComida,
    comprobarFaltaFecha,
    comprobarDatosPlato,
    comprobarPlatoACambiar,
    cambiarPlatoMenu
};