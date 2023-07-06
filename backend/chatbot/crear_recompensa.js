const { Card, Suggestion } = require('dialogflow-fulfillment');
const { obtenerUsuarioChatbot } = require('../controllers/usuarios');
const { crearRecompensaChatbot } = require('../controllers/recompensas');

const comprobarCrearRecompensa = async(agent) => {

    const paramRecompensa = agent.parameters.recompensa;
    const paramPuntos = agent.parameters.puntos;
    const { person: { name: perfilABuscar } } = agent.parameters; // Nombre del perfil
    const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;

    try {

        const usuario = await obtenerUsuarioChatbot({ uid });

        if (!perfilABuscar && paramRecompensa == '' && paramPuntos == '') {

            const respuesta = ['¿Cuál de tus perfiles quieres usar?'];
            usuario.perfiles.forEach(perfil => {
                respuesta.push(new Suggestion(perfil.nombre));
            });

            return agent.add(respuesta);
        } else if (perfilABuscar && paramRecompensa != '' && paramPuntos != '') {
            // Comprobar que el perfil seleccionado existe en los perfiles del usuario
            const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));
            if (!perfilEncontrado) {
                agent.context.delete('nutrifunccrear_recompensa-followup');
                return agent.add('No he encontrado el perfil que buscas, vuelve a intentarlo.');
            }

            // Quedarse con el id del perfil
            const perfilId = perfilEncontrado._id.toString();

            const pts = Number(paramPuntos);

            const recompensaCreada = await crearRecompensaChatbot(paramRecompensa, pts, perfilId);


            agent.context.delete('nutrifunccrear_recompensa-followup');
            return agent.add(new Card({
                title: 'La recompensa se ha creado correctamente',
                text: `Recompensa: ${recompensaCreada.nombre} --- Puntos: ${recompensaCreada.puntos}`,
                buttonUrl: agent.requestSource === 'TELEGRAM' ? `https://nutrius.ovh/inicio/recompensas/${perfilId}` : `/inicio/recompensas/${perfilId}`
            }));
        } else {
            throw new Error('Error en los parametros');
        }

    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifunccrear_recompensa-followup');
        agent.add('No se ha podido crear la recompensa, vuelve a intentarlo más tarde.');
    }
}

const comprobarCrearRecompensaPerfil = async(agent) => {

    return agent.add('¿Cuál es la recompensa que quieres registrar?');
}

const comprobarCrearRecompensaPerfilRecompensa = async(agent) => {

    const { recompensa } = agent.parameters;
    agent.context.set('nutrifunccrear_recompensa-followup', 5, { 'recompensa': recompensa });
    return agent.add('¿Cuántos puntos vale la recompensa?');
}

const comprobarCrearRecompensaPerfilRecompensaPuntos = async(agent) => {

    const puntos = agent.parameters.puntos;
    const { person: { name: perfilABuscar }, recompensa } = agent.contexts.find(context => context.name === 'nutrifunccrear_recompensa-followup').parameters;
    const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;

    try {

        const usuario = await obtenerUsuarioChatbot({ uid });

        // Comprobar que el perfil seleccionado existe en los perfiles del usuario
        const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));

        // Quedarse con el id del perfil
        const perfilId = perfilEncontrado._id.toString();
        const pts = Number(puntos);

        const recompensaCreada = await crearRecompensaChatbot(recompensa, pts, perfilId);

        agent.context.delete('nutrifunccrear_recompensa-followup');
        agent.context.delete('nutrifunccrear_recompensa-perfil-followup');
        agent.context.delete('nutrifunccrear_recompensa-perfil-recompensa-followup');

        return agent.add(new Card({
            title: 'La recompensa se ha creado correctamente:',
            text: `Recompensa: ${recompensaCreada.nombre} --- Puntos: ${recompensaCreada.puntos}`,
            buttonText: 'Ver recompensas',
            buttonUrl: agent.requestSource === 'TELEGRAM' ? `https://nutrius.ovh/inicio/recompensas/${perfilId}` : `/inicio/recompensas/${perfilId}`
        }));

    } catch (error) {
        console.error(error);
        if (error.code === 11000) return agent.add('Ya tienes una recompensa con ese nombre');
        return agent.add('No se ha podido crear la recompensa, vuelve a intentarlo más tarde');
    }
}

module.exports = {
    comprobarCrearRecompensa,
    comprobarCrearRecompensaPerfil,
    comprobarCrearRecompensaPerfilRecompensa,
    comprobarCrearRecompensaPerfilRecompensaPuntos
};