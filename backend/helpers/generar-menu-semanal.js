const cron = require('node-cron');
require('dotenv').config({ path: '../.env' });

const Menu = require('../models/menus');
const MenuPerfil = require('../models/menu_perfil');
const Usuario = require('../models/usuarios');
const Perfil = require('../models/perfiles');
const Islas = require('../models/islas');

const { conexionBD } = require('../database/configbd');
const { crearPlatoPerfil } = require('../controllers/plato_perfil');
const { addComida, getMesesDeLaSemanaActual, getNumeroSemana } = require('../controllers/menu_perfil');
const { populateMenu } = require('./variables');

cron.schedule(process.env.CRON_MENUS, async() => {
    try {
        conexionBD();

        let usuarios, totalUsuarios;
        let query = { rol: { $ne: "ROL_ADMIN" } };

        [usuarios, totalUsuarios] = await Promise.all([
            Usuario.find(query).populate('perfiles'),
            Usuario.countDocuments(query),
        ]);

        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 7);

        for(let i = 0; i < totalUsuarios; i++) {
            for(let j = 0; j < usuarios[i].perfiles.length; j++) {
                const perfil = usuarios[i].perfiles[j];
                console.log('Creando menu para: ', usuarios[i].perfiles[j]._id);
                await crearMenuPerfil('aleatorio', perfil._id.toString(), perfil.objetivo, fecha);
            }
        }

        console.log('----- Todos los MenuPerfil creados -----');
    
    } catch (error) {
        console.log(error);
    }
});

const crearMenuPerfil = async(mid, pid, objetivo, fecha) => {

    const body = {};

    let comiditas = {
        desayuno: {},
        almuerzo: {},
        comida: {},
        merienda: {},
        cena: {}
    }

    let menusemo = {
        lunes: { fecha: 0, comidas: comiditas },
        martes: { fecha: 0, comidas: comiditas },
        miercoles: { fecha: 0, comidas: comiditas },
        jueves: { fecha: 0, comidas: comiditas },
        viernes: { fecha: 0, comidas: comiditas },
        sabado: { fecha: 0, comidas: comiditas },
        domingo: { fecha: 0, comidas: comiditas }
    }

    try {
        body.menusem = menusemo;

        if (mid !== "aleatorio") {
            const existeMenu = await Menu.findById(mid).populate(populateMenu);
            if (!existeMenu) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El menu no existe, no se puede crear menu-perfil'
                });
            }
            body.menu_id = mid;
        } else {
            let objective = -1;
            switch (objetivo) {
                case "Bajar de peso":
                    objective = 1;
                    break;
                case "Subir de peso":
                    objective = 2;
                    break;
                case "Dieta saludable":
                    objective = 3;
                    break;
                default:
                    objective = 3;
                    break;
            }

            [listaMenus, total] = await Promise.all([
                Menu.find({ objetivo: objective }),
                Menu.countDocuments({ objetivo: objective })
            ]);
            if (listaMenus.length > 0) {
                const aleatorio = Math.ceil(Math.random() * (listaMenus.length - 1));
                const existeMenu = await Menu.findById(listaMenus[aleatorio]._id).populate(populateMenu);
                if (!existeMenu) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'El menu no existe, no se puede crear menu-perfil'
                    });
                }
                body.menu_id = listaMenus[aleatorio]._id;
            }
        }

        body.perfil_id = pid;
        
        const numSemana = getNumeroSemana(fecha);
        body.semana = numSemana;

        // Asignar una isla diferente a la que haya en el registro de islas del perfil
        const perfil = await Perfil.findById(pid);
        let islasNoDisponibles = perfil.islas;
        if (islasNoDisponibles.length == 5) {
            islasNoDisponibles = [];
        }

        let queryIslas = { _id: { $nin: islasNoDisponibles }, nombre: { $not: { $regex: new RegExp("isla1-base-bloqueado") } } };

        if (islasNoDisponibles.length == 0) {
            queryIslas = { nombre: { $not: { $regex: new RegExp("isla1-base-bloqueado") } } };
        }

        const nuevaIsla = await Islas.findOne(queryIslas);
        islasNoDisponibles.push(nuevaIsla._id);

        // Se añade a las islas del perfil
        await Perfil.findByIdAndUpdate(pid, { islas: islasNoDisponibles });

        // Meses involucrados en la semana actual
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const mesesSemana = getMesesDeLaSemanaActual(fecha);
        const stringMeses = [];

        for (let i = 0; i < mesesSemana.length; i++) {
            stringMeses.push(meses[mesesSemana[i]]);
        }

        const isla = await Islas.findById(nuevaIsla._id);
        let listaObjetos = [];
        let objeto = new Object();
        for (let i = 0; i < isla.objetos.length; i++) {
            objeto = new Object();
            objeto.id = isla.objetos[i]._id.toString();
            objeto.desbloqueado = false;
            objeto.dia = isla.objetos[i].dia;
            listaObjetos.push(objeto);
        }
        body.isla = {
            meses: stringMeses,
            isla: nuevaIsla._id,
            objetos: listaObjetos
        }

        const menuPerfil = new MenuPerfil(body);
        await menuPerfil.save();
        const existeMenu = await Menu.findById(menuPerfil.menu_id).populate(populateMenu);
        const dias = Object.entries(existeMenu.menusem.toObject());
        for (let i = 0; i < dias.length; i++) {
            const comidas = dias[i][1];
            for (let j = 0; j < comidas.desayuno.length; j++) {
                const plato = comidas.desayuno[j];
                const respuesta = await crearPlatoPerfil(plato.plato._id, pid, dias[i][0], "desayuno", fecha);
                await addComida(menuPerfil._id, dias[i][0], "desayuno", respuesta._id, fecha);
            }
            for (let j = 0; j < comidas.almuerzo.length; j++) {
                const plato = comidas.almuerzo[j];
                const respuesta = await crearPlatoPerfil(plato.plato._id, pid, dias[i][0], "almuerzo", fecha);
                await addComida(menuPerfil._id, dias[i][0], "almuerzo", respuesta._id, fecha);
            }
            for (let j = 0; j < comidas.comida.length; j++) {
                const plato = comidas.comida[j];
                const respuesta = await crearPlatoPerfil(plato.plato._id, pid, dias[i][0], "comida", fecha);
                await addComida(menuPerfil._id, dias[i][0], "comida", respuesta._id, fecha);
            }
            for (let j = 0; j < comidas.merienda.length; j++) {
                const plato = comidas.merienda[j];
                const respuesta = await crearPlatoPerfil(plato.plato._id, pid, dias[i][0], "merienda", fecha);
                await addComida(menuPerfil._id, dias[i][0], "merienda", respuesta._id, fecha);
            }
            for (let j = 0; j < comidas.cena.length; j++) {
                const plato = comidas.cena[j];
                const respuesta = await crearPlatoPerfil(plato.plato._id, pid, dias[i][0], "cena", fecha);
                await addComida(menuPerfil._id, dias[i][0], "cena", respuesta._id, fecha);
            }
        }

        console.log('MenuPerfil creado correctamente');

    } catch (error) {
        console.log(error);
    }
}