const { Card, Suggestion } = require('dialogflow-fulfillment');
const { obtenerUsuarioChatbot } = require('../controllers/usuarios');

const comprobarDescargarSeguimiento = async(agent) => {
    const { person: { name: perfilABuscar } } = agent.parameters;
    const paramSeccion = agent.parameters.seccion;
    const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;

    try {
        const usuario = await obtenerUsuarioChatbot({ uid });

        // me falta perfil y seccion
        if (!perfilABuscar && paramSeccion == '') {
            const respuesta = ['¿De cuál de tus perfiles quieres ver el seguimiento?'];
            usuario.perfiles.forEach(perfil => {
                respuesta.push(new Suggestion(perfil.nombre));
            });

            return agent.add(respuesta);
        }
        // tengo perfil y seccion
        else if (perfilABuscar && paramSeccion != '') {
            // busco que el perfil exista
            const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));

            // si no existe
            if (!perfilEncontrado) {
                agent.context.delete('nutrifuncseguimiento-followup');
                return agent.add('No he encontrado el perfil que buscas, vuelve a intentarlo');
            }

            let seccion = '';
            switch (paramSeccion) {
                case 'Resumen':
                    seccion = 'seg-resumen';
                    break;
                case 'Comidas': 
                    seccion = 'seg-comidas';
                    break;
                case 'Peso y altura':
                    seccion = 'seg-peso-altura';
                    break;
            }

            // si existe
            const perfilId = perfilEncontrado._id.toString();
            const nombrePerfil = perfilEncontrado.nombre;

            agent.context.delete('nutrifuncseguimiento-followup');
            return agent.add(new Card({
                title: `Seguimiento de ${nombrePerfil}`,
                text: `${paramSeccion}`,
                buttonText: 'Ver seguimiento',
                buttonUrl: agent.requestSource === 'TELEGRAM' ? `https://nutrius.ovh/inicio/${seccion}/${perfilId}` : `/inicio/${seccion}/${perfilId}`
            }));
        } else {
            throw new Error('Error en los parámetros');
        }

    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifuncseguimiento-followup');
        agent.add('No he podido descargar el seguimiento, por favor, vuelve a intentarlo más tarde.');
    }
}

const comprobarDescargarSeguimientoPerfil = async(agent) => {
    const respuesta = ['¿Qué sección del seguimiento deseas ver?'];
    respuesta.push(new Suggestion('Resumen'));
    respuesta.push(new Suggestion('Comidas'));
    respuesta.push(new Suggestion('Peso y altura'));

    return agent.add(respuesta);
}

const comprobarDescargarSeguimientoPerfilSeccion = async(agent) => {
    const { person: { name: perfilABuscar }, seccion } = agent.contexts.find(context => context.name === 'nutrifuncseguimiento-followup').parameters;
    const { uid } = agent.contexts.find(context => context.name === 'contexto_usuario').parameters;
    const paramSeccion = agent.parameters.seccion;

    try {
        const usuario = await obtenerUsuarioChatbot({ uid });
        const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));
        const perfilId = perfilEncontrado._id.toString();
        const nombrePerfil = perfilEncontrado.nombre;

        let seccion = '';
        switch (paramSeccion) {
            case 'Resumen':
                seccion = 'seg-resumen';
                break;
            case 'Comidas': 
                seccion = 'seg-comidas';
                break;
            case 'Peso y altura':
                seccion = 'seg-peso-altura';
                break;
        }

        agent.context.delete('nutrifuncseguimiento-followup');
        agent.context.delete('nutrifuncseguimiento-perfil-followup');

        return agent.add(new Card({
            title: `Seguimiento de ${nombrePerfil}`,
            text: `${paramSeccion}`,
            buttonText: 'Ver seguimiento',
            buttonUrl: agent.requestSource === 'TELEGRAM' ? `https://nutrius.ovh/inicio/${seccion}/${perfilId}` : `/inicio/${seccion}/${perfilId}`
        }));

    } catch (error) {
        console.error(error);
        return agent.add('No he podido descargar el seguimiento, por favor, vuelve a intentarlo más tarde.');
    }
}

module.exports = {
    comprobarDescargarSeguimiento,
    comprobarDescargarSeguimientoPerfil,
    comprobarDescargarSeguimientoPerfilSeccion,
}