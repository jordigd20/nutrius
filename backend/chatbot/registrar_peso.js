const { Card, Suggestion } = require('dialogflow-fulfillment');
const { obtenerUsuarioChatbot } = require('../controllers/usuarios');
const { registrarPesoAlturaChatbot } = require('../controllers/seguimiento');


const registrarPesoYAltura = async(agent) => {
    const paramPeso = agent.parameters.peso;
    const paramAltura = agent.parameters.altura;
    const paramFecha = agent.parameters['date-time']; // fecha
    const { person: { name: perfilABuscar } } = agent.parameters; // Nombre del perfil
    const { uid } = agent.contexts.find( context => context.name === 'contexto_usuario').parameters;
    
    try {

        const usuario = await obtenerUsuarioChatbot({uid});

        if((paramFecha === '' || paramFecha.endDateTime !== undefined) && !perfilABuscar && paramPeso == '' && paramAltura == '' ) {
            
            const respuesta = ['¿Cuál de tus perfiles quieres usar?'];
            usuario.perfiles.forEach(perfil => {
                respuesta.push(new Suggestion(perfil.nombre));
            });

            return agent.add(respuesta);

        } else if (paramFecha !== '' && perfilABuscar && paramPeso != '' && paramAltura != '') {

            const fecha = new Date(paramFecha);
            const splitPeso = paramPeso.split(' ');     //  ['peso'],  ['a'], [45.5] ---  ['peso'],  [45.5]
            const splitAltura = paramAltura.split(' '); // ['altura'], ['a'], [1.10] --- ['altura'], [1.10]

            const peso = splitPeso[1] === 'a' ? splitPeso[2] : splitPeso[1];
            const altura = splitAltura[1] === 'a' ? splitAltura[2] : splitAltura[1];

            const usuario = await obtenerUsuarioChatbot({uid});
            // Comprobar que el perfil seleccionado existe en los perfiles del usuario
            const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));
            if(!perfilEncontrado) {
                agent.context.delete('nutrifunccambiar_plato-followup');
                return agent.add('No he encontrado el perfil que buscas, vuelve a intentarlo.');
            }

            // Quedarse con el id del perfil
            const perfilId = perfilEncontrado._id.toString();

            const seguimiento =  await registrarPesoAlturaChatbot(fecha, Number(peso), Number(altura), perfilId);
            
            let textoCard = ` Peso: ${seguimiento.peso} kg--- Altura: ${seguimiento.altura} cm--- Fecha: ${fecha.getDate()}-${fecha.getMonth()+1}-${fecha.getFullYear()}--- Variacion: ${Math.round(seguimiento.variacion * 100)/100} kg--- Diferencia con objetivo: ${Math.round(seguimiento.difObjetivo * 100)/100} kg`; 
            if(!seguimiento.variacion) {
               textoCard =  ` Peso: ${seguimiento.peso} kg--- Altura: ${seguimiento.altura} cm--- Fecha: ${fecha.getDate()}-${fecha.getMonth()+1}-${fecha.getFullYear()}--- Diferencia con objetivo: ${Math.round(seguimiento.difObjetivo * 100)/100} kg`;
            }

            agent.context.delete('nutrifuncregistrar_peso-followup');
            return agent.add(new Card({
                title: 'Se han registrado correctamente estos datos:',
                text: textoCard,
                imageUrl: '',
                buttonText: 'Ver registro en detalle',
                buttonUrl: agent.requestSource === 'TELEGRAM' ? `https://nutrius.ovh/inicio/seg-peso-altura/${perfilId}` : `/inicio/seg-peso-altura/${perfilId}`
            }));

        } else {
            throw new Error('Error en los parametros');
        }
    } catch (error) {
        console.error(error);
        agent.context.delete('nutrifuncregistrar_peso-followup');
        agent.add('No he podido registrar el peso y la altura, porfavor, vuelve a intentarlo más tarde.')
    }

}

const comprobarRegistroPesoPerfil = async(agent) => {
    return agent.add('¿Cuál es el peso que quieres registrar? (en kg)');
}

const comprobarRegistroPesoPeso = async(agent) => {
    const { peso } = agent.parameters;
    agent.context.set('nutrifuncregistrar_peso-followup', 5, { 'peso': peso });
    return agent.add('¿Cuál es la altura que quieres registrar? (en cm)');
}

const comprobarRegistroPesoAltura = async(agent) => {
    const { altura } = agent.parameters;
    const { peso } = agent.contexts.find( context => context.name === 'nutrifuncregistrar_peso-followup').parameters;
    agent.context.set('nutrifuncregistrar_peso-followup', 5, { 'peso': peso, 'altura': altura });
    return agent.add('¿Cuál es la fecha que quieres registrar?');
}

const comprobarRegistroPesoFecha = async(agent) => {
    const paramFecha = agent.parameters['date-time'];
    const { person: { name: perfilABuscar }, peso, altura } = agent.contexts.find( context => context.name === 'nutrifuncregistrar_peso-followup').parameters;
    const { uid } = agent.contexts.find( context => context.name === 'contexto_usuario').parameters;
    const fecha = new Date(paramFecha);
    try {
        const usuario = await obtenerUsuarioChatbot({uid});
        // Comprobar que el perfil seleccionado existe en los perfiles del usuario
        const perfilEncontrado = usuario.perfiles.find(perfil => new RegExp(perfilABuscar, 'i').test(perfil.nombre));

        // Quedarse con el id del perfil
        const perfilId = perfilEncontrado._id.toString();
        
        const seguimiento =  await registrarPesoAlturaChatbot(fecha, Number(peso), Number(altura), perfilId);
        
        let textoCard = ` Peso: ${seguimiento.peso} kg--- Altura: ${seguimiento.altura} cm--- Fecha: ${fecha.getDate()}-${fecha.getMonth()+1}-${fecha.getFullYear()}--- Variacion: ${Math.round(seguimiento.variacion * 100)/100} kg--- Diferencia con objetivo: ${Math.round(seguimiento.difObjetivo * 100)/100} kg`; 
        if(!seguimiento.variacion) {
           textoCard =  ` Peso: ${seguimiento.peso} kg--- Altura: ${seguimiento.altura} cm--- Fecha: ${fecha.getDate()}-${fecha.getMonth()+1}-${fecha.getFullYear()}--- Diferencia con objetivo: ${Math.round(seguimiento.difObjetivo * 100)/100} kg`;
        }

        agent.context.delete('nutrifuncregistrar_peso-followup');
        agent.context.delete('nutrifuncregistrar_peso-perfil-followup');
        agent.context.delete('nutrifuncregistrar_peso-perfil-peso-altura-followup');
        return agent.add(new Card({
            title: 'Se han registrado correctamente estos datos:',
            text: textoCard,
            imageUrl: '',
            buttonText: 'Ver registro en detalle',
            buttonUrl: agent.requestSource === 'TELEGRAM' ? `https://nutrius.ovh/inicio/seg-peso-altura/${perfilId}` : `/inicio/seg-peso-altura/${perfilId}`
        }));
    } catch (error) {
        console.error(error);
        return agent.add('No he podido registrar el peso y la altura, porfavor, vuelve a intentarlo más tarde.');
    }
}

module.exports = { 
    registrarPesoYAltura, 
    comprobarRegistroPesoPerfil, 
    comprobarRegistroPesoPeso, 
    comprobarRegistroPesoAltura, 
    comprobarRegistroPesoFecha 
};