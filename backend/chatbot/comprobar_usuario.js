const { Suggestion } = require('dialogflow-fulfillment');
const { obtenerUsuarioChatbot } = require('../controllers/usuarios');
const { autenticarUsuarioChatbot, verificarToken } = require('../controllers/auth');

const funcionalidadesUsuario = async(agent) => {
    const respuestas = [
        '¡Buenas! Mi nombre es Nutri. Soy la asistente virtual de NutriUs. ¿Deseas acceder a las funcionalidades de tu usuario?',
        '¡Hola! Soy Nutri, la asistente virtual de NutriUs y estoy aquí para ayudarte. ¿Deseas acceder a las funcionalidades de tu usuario?',
        '¡Hola! ¿Qué tal? Me llamo Nutri, y soy la asistente virtual de NutriUs. ¿Deseas acceder a las funcionalidades de tu usuario?'
    ];

    const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
    agent.add(respuestaAleatoria);
    agent.add(new Suggestion('Si'));
    agent.add(new Suggestion('No'));
}

const aceptarFuncionalidades = async(agent) => {
    agent.add(''); 
    agent.setFollowupEvent('iniciar_sesion');
}

const comprobarUsuario = async(agent) => {
    const { email } = agent.parameters;

    try {
        const usuario = await obtenerUsuarioChatbot({email});
        
        if(!usuario) {
            agent.context.delete('nutrifuncusuario-followup');
            return agent.add('No he podido encontrar tu usuario, prueba a intentarlo de nuevo.');
        }

        agent.context.set('contexto_usuario', 5, {'uid': usuario._id.toString(), 'premium': usuario.premium});
        const respuestas = [
            'Por favor, introduce tu contraseña para poder autenticarte',
            '¿Podrías introducir tu contraseña para autenticarte?',
        ];
        const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
        agent.add(respuestaAleatoria);

    } catch (error) {
        agent.context.delete('contexto_usuario');
        console.error(error);
        agent.add(`Ha ocurrido un error al comprobar el usuario, porfavor, vuelve a intentarlo más tarde.`);
    }

}

const autenticarUsuario = async(agent) => {
    const { password } = agent.parameters;
    const { uid } = agent.contexts.find( context => context.name === 'contexto_usuario').parameters;

    try {
        const usuario = await obtenerUsuarioChatbot({uid});
        const autenticacion = await autenticarUsuarioChatbot(uid, password);

        agent.context.delete('nutrifuncusuario-followup');
        agent.add(`¡Hola ${usuario.nombre_usuario}! Aquí te dejo una lista de las funciones que dispongo ¿Deseas realizar alguna? 😄`);
        agent.add(new Suggestion('Mostrar un dia del menu'));
        agent.add(new Suggestion('Mostrar seguimiento'));
        agent.add(new Suggestion('Registrar peso'));
        agent.add(new Suggestion('Cambiar un plato del menu'));
        agent.add(new Suggestion('Crear recompensa'));
    } catch (error) {
        console.error(error);
        const { lifespan } = agent.contexts.find( context => context.name === 'nutrifuncusuario-followup');
        // Si se acaba el lifespan del intent de poner la contraseña, se vuelve a empezar por el email
        if(lifespan == null) {
           return agent.add(`Por favor introduce tu email para poder identificarte`);
        }
        agent.add(`La autenticación ha sido incorrecta, por favor vuelve a introducir la contraseña`);
    }

}

const autenticarUsuarioWeb = async(agent) => {
    const { token } = agent.contexts.find( context => context.name === 'autenticar_web').parameters;

    try {
        
        const usuario = await verificarToken(token);

        agent.context.set('contexto_usuario', 5, {'uid': usuario._id.toString(), 'email': usuario.email, 'premium': usuario.premium});
        agent.context.delete('autenticar_web');
        agent.add(`¡Hola ${usuario.nombre_usuario}! Aquí te dejo una lista de las funciones que dispongo ¿Deseas realizar alguna? 😄`);
        agent.add(new Suggestion('Mostrar un dia del menu'));
        agent.add(new Suggestion('Mostrar seguimiento'));
        agent.add(new Suggestion('Registrar peso'));
        agent.add(new Suggestion('Cambiar un plato del menu'));
        agent.add(new Suggestion('Crear recompensa'));
    } catch (error) {
        agent.add(`No he podido autenticarte correctamente, por favor, vuelve a intentarlo más tarde`);
    }
}

module.exports = { comprobarUsuario, funcionalidadesUsuario, aceptarFuncionalidades, autenticarUsuario, autenticarUsuarioWeb };