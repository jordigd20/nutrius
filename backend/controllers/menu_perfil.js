const { response } = require("express");
const MenuPerfil = require('../models/menu_perfil');
const Menu = require('../models/menus');
const Perfil = require('../models/perfiles');
const PlatoPerfil = require('../models/plato_perfil');
const Plato = require('../models/platos');
const Islas = require('../models/islas');
const { crearPlatoPerfil } = require('../controllers/plato_perfil');
const { borrarPlato } = require('../controllers/plato_perfil');
const { populateMenuPerfil, populateMenu } = require('../helpers/variables');

const fs = require('fs');

// le paso id del perfil
const obtenerMenuPerfil = async(req, res = response) => {
    const id = req.query.id || "";
    const desde = Number(req.query.desde) || 0;
    const fecha_desde = req.query.fechaDesde || '';
    const fecha_hasta = req.query.fechaHasta || '';

    let populate = false;
    if (req.query.populate && req.query.populate == "true") {
        populate = true;
    }

    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }

    try {
        let populatePaths = [];

        if (populate) {
            populatePaths = populateMenuPerfil;
        }

        if (!id) {
            [listaMenuPerfil, total] = await Promise.all([
                MenuPerfil.find().populate('menu_id'),
                MenuPerfil.countDocuments()
            ]);
            return res.json({
                ok: true,
                msg: 'Devuelvo todos los menúsPerfil',
                listaMenuPerfil,
                page: {
                    desde,
                    registropp,
                    total,
                }
            });
        }

        const existeMenuPerfil = await MenuPerfil.findById(id).populate(populatePaths);
        const existePerfil = await Perfil.findById(id);
        const existeMenu = await Menu.findById(id);
        const query = {};

        if (!existeMenuPerfil && !existePerfil && !existeMenu) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador no existe'
            });
        }

        if (fecha_desde) {
            query['menusem.lunes.fecha'] = {
                $gte: fecha_desde
            }
        }

        if (fecha_hasta) {
            query['menusem.lunes.fecha'] = {
                $lte: fecha_hasta
            }
        }

        if (fecha_desde && fecha_hasta) {
            query['menusem.lunes.fecha'] = {
                $gte: fecha_desde,
                $lte: fecha_hasta
            }
        }

        //si me pasa un id de perfil le devuelvo todos los menu-perfil de ese perfil
        if ((!existeMenuPerfil && !existeMenu) && existePerfil) {
            let listaMenuPerfil, total;
            query.perfil_id = id;
            [listaMenuPerfil, total] = await Promise.all([
                MenuPerfil.find(query).populate(populatePaths).limit(registropp),
                MenuPerfil.countDocuments(query)
            ]);

            res.json({
                ok: true,
                msg: 'Devuelvo los menús del perfil',
                listaMenuPerfil,
                page: {
                    desde,
                    registropp,
                    total,
                }
            });
        } else if (existeMenu && !existeMenuPerfil) { //si me pasa un id de menu devuelvo todos los menu perfil con ese menu
            let listaMenuPerfil, total;
            query.menu_id = id;
            [listaMenuPerfil, total] = await Promise.all([
                MenuPerfil.find(query).populate(populatePaths).limit(registropp),
                MenuPerfil.countDocuments(query)
            ]);

            res.json({
                ok: true,
                msg: 'Devuelvo los menú-perfil con el menú',
                listaMenuPerfil,
                page: {
                    desde,
                    registropp,
                    total,
                }
            });
        } else if (existeMenuPerfil) { //si me pasa un id de menu-perfil se lo devuelvo
            res.json({
                ok: true,
                msg: 'Devuelvo un menú de un perfil',
                existeMenuPerfil
            });
        }
    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'Error get menu_perfil'
        });
    }
}

const obtenerComidasHoy = async(req, res = response) => {
    const id = req.params.pid;

    try {
        const fecha = new Date();
        const menuPerfil = await MenuPerfil.findById(id);
        let listaComidas = new Array();
        if (!menuPerfil) {
            res.status(400).json({
                ok: false,
                msg: 'No existe el menu'
            });
        }

        Object.entries(menuPerfil.menusem.toObject()).forEach(([dia, valor]) => {
            if (fecha.getDay() === valor.fecha.getDay()) {
                Object.entries(valor.comidas).forEach(([comida, completa]) => {
                    let com = new Object();
                    com.comida = comida.charAt(0).toUpperCase() + comida.slice(1);
                    com.completa = completa.completada;
                    listaComidas.push(com);
                });
            }
        });
        res.json({
            ok: true,
            msg: 'Obtengo las comidas de hoy',
            listaComidas
        });

    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'Error al obtener las comidas de hoy'
        });
        console.error(error);
    }
}


// le paso perfil_id
const obtenerComidasNoCompletadasMenuPerfil = async(req, res = response) => {
    const pid = req.params.pid;

    try {
        const existePerfil = await Perfil.findById(pid);
        if (!existePerfil) {
            return res.status(400).json({
                ok: false,
                msg: 'El perfil no existe'
            });
        }
        const menuPerfil = await MenuPerfil.findOne({ perfil_id: pid });
        if (!menuPerfil) {
            return res.status(400).json({
                ok: false,
                msg: 'El perfil no tiene asociado ningún menú'
            });
        }

        // Array de objetos con los platos no completados
        let no_completadas = new Array();
        let listaComidasNoCompletadas;
        Object.entries(menuPerfil.menusem.toObject()).forEach(([dia, valor]) => {
            valor.comidas.desayuno.platos.forEach(plato => {
                const platoNoCompletado = checkCompletado(plato.plato);
                no_completadas.push(platoNoCompletado);
            });
            valor.comidas.almuerzo.platos.forEach(plato => {
                const platoNoCompletado = checkCompletado(plato.plato);
                no_completadas.push(platoNoCompletado);
            });
            valor.comidas.comida.platos.forEach(plato => {
                const platoNoCompletado = checkCompletado(plato.plato);
                no_completadas.push(platoNoCompletado);
            });
            valor.comidas.merienda.platos.forEach(plato => {
                const platoNoCompletado = checkCompletado(plato.plato);
                no_completadas.push(platoNoCompletado);
            });
            valor.comidas.cena.platos.forEach(plato => {
                const platoNoCompletado = checkCompletado(plato.plato);
                no_completadas.push(platoNoCompletado);
            });
        });
        listaComidasNoCompletadas = await Promise.all(no_completadas);

        //Array para meter las 3 ultimas comidas no completadas
        const newLista = new Array();
        let cont = 0;
        for (let i = listaComidasNoCompletadas.length - 1; i > 0 && cont < 3; i--) {
            if (listaComidasNoCompletadas[i] !== "vacio") {
                let newO = new Object();
                newO.id = listaComidasNoCompletadas[i]._id;
                const plato = await Plato.findById(listaComidasNoCompletadas[i].plato_id);
                if (plato) {
                    newO.nombre = plato.nombre;
                }
                newO.vecesFallado = listaComidasNoCompletadas[i].veces_fallado;
                let date = false;
                let hoy = new Date();
                for (let j = listaComidasNoCompletadas[i].info_plato.length - 1; j > 0 && !date; j--) {
                    if ((listaComidasNoCompletadas[i].info_plato[j].fecha.getFullYear() < hoy.getFullYear()) ||
                        (listaComidasNoCompletadas[i].info_plato[j].fecha.getFullYear() === hoy.getFullYear() &&
                            listaComidasNoCompletadas[i].info_plato[j].fecha.getMonth() < hoy.getMonth()) ||
                        (listaComidasNoCompletadas[i].info_plato[j].fecha.getMonth() === hoy.getMonth() &&
                            listaComidasNoCompletadas[i].info_plato[j].fecha.getDate() <= hoy.getDate())) {
                        newO.fecha = listaComidasNoCompletadas[i].info_plato[j].fecha.getDate() + '/' +
                            (listaComidasNoCompletadas[i].info_plato[j].fecha.getMonth() + 1) + '/' +
                            listaComidasNoCompletadas[i].info_plato[j].fecha.getFullYear();
                        date = true;
                    }
                }
                newLista.push(newO);
                cont++;
            }
        }
        res.json({
            ok: true,
            msg: 'Obtengo las últimas 3 comidas no completadas',
            newLista
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'Error al obtener las últimas 3 comidas no completadas'
        });
        console.error(error);
    }
}

const checkCompletado = async(id) => {
    let noCompletado = "vacio";
    try {
        const existepPerfil = await PlatoPerfil.findById(id);
        if (existepPerfil) {
            if (existepPerfil.info_plato.length > 0) {
                existepPerfil.info_plato.forEach(element => {
                    if (!element.completado) {
                        noCompletado = existepPerfil;
                    }
                });
            }
        }
        return noCompletado;
    } catch (error) {
        console.error(error);
    }
}

// le paso menu_id y perfil_id 
const crearMenuPerfil = async(req, res = response) => {
    const mid = req.params.mid;
    const pid = req.params.pid;
    const objetivo = req.body.objetivo;
    const fecha = new Date(req.body.fecha);

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
        req.body.menusem = menusemo;

        if (mid !== "aleatorio") {
            const existeMenu = await Menu.findById(mid).populate(populateMenu);
            if (!existeMenu) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El menu no existe, no se puede crear menu-perfil'
                });
            }
            req.body.menu_id = mid;
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
                req.body.menu_id = listaMenus[aleatorio]._id;
            }
        }

        req.body.perfil_id = pid;

        const numSemana = getNumeroSemana(fecha);
        req.body.semana = numSemana;

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
        req.body.isla = {
            meses: stringMeses,
            isla: nuevaIsla._id,
            objetos: listaObjetos
        }

        const menuPerfil = new MenuPerfil(req.body);
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
        res.json({
            ok: true,
            msg: 'Menu-perfil creado',
            menuPerfil
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'Error al crear menu-perfil'
        });
        console.error(error);
    }
}

/*
    Función extraída de:
    https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
*/
const getNumeroSemana = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

    return weekNumber;
}

const restarDias = (fecha) => {
    let res = new Date(fecha);
    res.setDate(res.getDate() - 1);
    return res;
}

const sumarDias = (fecha) => {
    let res = new Date(fecha);
    res.setDate(res.getDate() + 1);
    return res;
}

const addComida = async(idMenu, day, comida, idPlatoPerfil, f) => {
    try {
        let fecha = f;
        let dia = -1;
        switch (day) {
            case "lunes":
                dia = 1;
                break;
            case "martes":
                dia = 2;
                break;
            case "miercoles":
                dia = 3;
                break;
            case "jueves":
                dia = 4;
                break;
            case "viernes":
                dia = 5;
                break;
            case "sabado":
                dia = 6;
                break;
            case "domingo":
                dia = 0;
                break;
        }
        let esLunes = false;
        let coincide = false;
        while (!esLunes) {
            if (fecha.getDay() == 1) {
                esLunes = true;
            } else {
                fecha = restarDias(fecha);
            }
        }
        while (!coincide) {
            if (fecha.getDay() == dia) {
                coincide = true;
            } else {
                fecha = sumarDias(fecha);
            }
        }
        const menu = await MenuPerfil.findById(idMenu);
        if (menu) {
            const newPlato = new Object();
            newPlato.plato = idPlatoPerfil;
            newPlato.completado = false;
            switch (dia) {
                case 1:
                    menu.menusem.lunes.fecha = fecha;
                    switch (comida) {
                        case "desayuno":
                            menu.menusem.lunes.comidas.desayuno.platos.push(newPlato);
                            break;
                        case "almuerzo":
                            menu.menusem.lunes.comidas.almuerzo.platos.push(newPlato);
                            break;
                        case "comida":
                            menu.menusem.lunes.comidas.comida.platos.push(newPlato);
                            break;
                        case "merienda":
                            menu.menusem.lunes.comidas.merienda.platos.push(newPlato);
                            break;
                        case "cena":
                            menu.menusem.lunes.comidas.cena.platos.push(newPlato);
                            break;
                        default:
                            break;
                    }
                    break;
                case 2:
                    menu.menusem.martes.fecha = fecha;
                    switch (comida) {
                        case "desayuno":
                            menu.menusem.martes.comidas.desayuno.platos.push(newPlato);
                            break;
                        case "almuerzo":
                            menu.menusem.martes.comidas.almuerzo.platos.push(newPlato);
                            break;
                        case "comida":
                            menu.menusem.martes.comidas.comida.platos.push(newPlato);
                            break;
                        case "merienda":
                            menu.menusem.martes.comidas.merienda.platos.push(newPlato);
                            break;
                        case "cena":
                            menu.menusem.martes.comidas.cena.platos.push(newPlato);
                            break;
                        default:
                            break;
                    }
                    break;
                case 3:
                    menu.menusem.miercoles.fecha = fecha;
                    switch (comida) {
                        case "desayuno":
                            menu.menusem.miercoles.comidas.desayuno.platos.push(newPlato);
                            break;
                        case "almuerzo":
                            menu.menusem.miercoles.comidas.almuerzo.platos.push(newPlato);
                            break;
                        case "comida":
                            menu.menusem.miercoles.comidas.comida.platos.push(newPlato);
                            break;
                        case "merienda":
                            menu.menusem.miercoles.comidas.merienda.platos.push(newPlato);
                            break;
                        case "cena":
                            menu.menusem.miercoles.comidas.cena.platos.push(newPlato);
                            break;
                        default:
                            break;
                    }
                    break;
                case 4:
                    menu.menusem.jueves.fecha = fecha;
                    switch (comida) {
                        case "desayuno":
                            menu.menusem.jueves.comidas.desayuno.platos.push(newPlato);
                            break;
                        case "almuerzo":
                            menu.menusem.jueves.comidas.almuerzo.platos.push(newPlato);
                            break;
                        case "comida":
                            menu.menusem.jueves.comidas.comida.platos.push(newPlato);
                            break;
                        case "merienda":
                            menu.menusem.jueves.comidas.merienda.platos.push(newPlato);
                            break;
                        case "cena":
                            menu.menusem.jueves.comidas.cena.platos.push(newPlato);
                            break;
                        default:
                            break;
                    }
                    break;
                case 5:
                    menu.menusem.viernes.fecha = fecha;
                    switch (comida) {
                        case "desayuno":
                            menu.menusem.viernes.comidas.desayuno.platos.push(newPlato);
                            break;
                        case "almuerzo":
                            menu.menusem.viernes.comidas.almuerzo.platos.push(newPlato);
                            break;
                        case "comida":
                            menu.menusem.viernes.comidas.comida.platos.push(newPlato);
                            break;
                        case "merienda":
                            menu.menusem.viernes.comidas.merienda.platos.push(newPlato);
                            break;
                        case "cena":
                            menu.menusem.viernes.comidas.cena.platos.push(newPlato);
                            break;
                        default:
                            break;
                    }
                    break;
                case 6:
                    menu.menusem.sabado.fecha = fecha;
                    switch (comida) {
                        case "desayuno":
                            menu.menusem.sabado.comidas.desayuno.platos.push(newPlato);
                            break;
                        case "almuerzo":
                            menu.menusem.sabado.comidas.almuerzo.platos.push(newPlato);
                            break;
                        case "comida":
                            menu.menusem.sabado.comidas.comida.platos.push(newPlato);
                            break;
                        case "merienda":
                            menu.menusem.sabado.comidas.merienda.platos.push(newPlato);
                            break;
                        case "cena":
                            menu.menusem.sabado.comidas.cena.platos.push(newPlato);
                            break;
                        default:
                            break;
                    }
                    break;
                case 0:
                    menu.menusem.domingo.fecha = fecha;
                    switch (comida) {
                        case "desayuno":
                            menu.menusem.domingo.comidas.desayuno.platos.push(newPlato);
                            break;
                        case "almuerzo":
                            menu.menusem.domingo.comidas.almuerzo.platos.push(newPlato);
                            break;
                        case "comida":
                            menu.menusem.domingo.comidas.comida.platos.push(newPlato);
                            break;
                        case "merienda":
                            menu.menusem.domingo.comidas.merienda.platos.push(newPlato);
                            break;
                        case "cena":
                            menu.menusem.domingo.comidas.cena.platos.push(newPlato);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            await menu.save();
        }
    } catch (error) {
        console.error(error);
    }
}

const updateFalladas = (idMenu, falladas, total) => {
    return new Promise(async(resolve, reject) => {
        try {
            const menu = await MenuPerfil.findById(idMenu);
            if (menu) {
                menu.comidas_falladas = falladas;
                const eficacia = Math.ceil((total - falladas) / total * 100);
                menu.eficacia = eficacia;
                menu.save();
            }
            resolve(complete);

        } catch (error) {
            reject(error);
        }
    });
}

const actualizarMenuPerfil = async(req, res = response) => {
    const id = req.params.id;
    const menusem = req.body.menusem;

    try {
        const estaMenuPerfil = await MenuPerfil.findById(id);
        if (!estaMenuPerfil) {
            return res.status(400).json({
                ok: false,
                msg: 'El menuPerfil no existe'
            });
        }

        const existeMenuPerfil = await MenuPerfil.findByIdAndUpdate(id, { menusem }, { new: true });
        let falladas = 0;
        let total = 0;
        let completadas = 0;
        let totalPuntos = 0;
        let eficacia = 0;
        let data = fs.readFileSync('../frontend/src/assets/json/elementos.json', 'utf8');
        let jsondat = JSON.parse(data);
        let comidaCompletada;

        //Se recorren los dias
        existeMenuPerfil.platos_marcados = 0;
        for (let x = 0; x < 7; x++) {
            let dia = jsondat[4].elementos[x].propiedad;
            let fecha = existeMenuPerfil.menusem[dia].fecha;
            let platosCompletados = 0;
            let totalPlatosComida = 0;

            //Se recorren las comidas
            for (let z = 0; z < 5; z++) {
                let comida = jsondat[2].elementos[z].propiedad;
                comidaCompletada = true;
                let numo = existeMenuPerfil.menusem[dia].comidas[comida].platos.length;

                //Se recorren los platos
                for (let i = 0; i < numo; i++) {
                    const pperfil = await PlatoPerfil.findById(existeMenuPerfil.menusem[dia].comidas[comida].platos[i].plato);
                    if (pperfil) {

                        //Se recorren los info_plato del plato_perfil
                        for (let l = 0; l < pperfil.info_plato.length; l++) {
                            let valor = pperfil.info_plato[l];
                            if (fecha.getDate() === valor.fecha.getDate() && fecha.getMonth() === valor.fecha.getMonth() &&
                                fecha.getFullYear() === valor.fecha.getFullYear() && comida === valor.comida) {
                                totalPlatosComida = totalPlatosComida + 1;
                                if (valor.marcado) {
                                    existeMenuPerfil.menusem[dia].comidas[comida].platos[i].completado = true;
                                    if (valor.completado) {
                                        platosCompletados = platosCompletados + 1;
                                        existeMenuPerfil.menusem[dia].comidas[comida].platos[i].fallado = false;
                                    } else {
                                        existeMenuPerfil.menusem[dia].comidas[comida].platos[i].fallado = true;
                                        comidaCompletada = false;
                                    }
                                } else {
                                    comidaCompletada = false;
                                }
                            }
                        }
                        if (existeMenuPerfil.menusem[dia].comidas[comida].platos[i].completado) {
                            existeMenuPerfil.platos_marcados = existeMenuPerfil.platos_marcados + 1;
                        }
                    }
                }
                existeMenuPerfil.menusem[dia].comidas[comida].completada = comidaCompletada;
                total = total + 1;

                if (existeMenuPerfil.menusem[dia].comidas[comida].completada) {
                    completadas = completadas + 1;
                    totalPuntos = totalPuntos + existeMenuPerfil.menusem[dia].comidas[comida].puntos;
                } else {
                    let fallado = false;
                    for (let i = 0; i < existeMenuPerfil.menusem[dia].comidas[comida].platos.length; i++) {
                        if (existeMenuPerfil.menusem[dia].comidas[comida].platos[i].completado && existeMenuPerfil.menusem[dia].comidas[comida].platos[i].fallado) {
                            fallado = true;
                        }
                    }
                    if (fallado) {
                        falladas = falladas + 1;
                        eficacia = Math.ceil((total - falladas) / total * 100);
                    }
                }
            }
            let porcentajePlatosComidos = platosCompletados / totalPlatosComida * 100;
            for (let i = 0; i < existeMenuPerfil.isla.objetos.length; i++) {
                if (existeMenuPerfil.isla.objetos[i].dia == dia) {
                    if (porcentajePlatosComidos >= 75) {
                        existeMenuPerfil.isla.objetos[i].desbloqueado = true;
                    } else {
                        existeMenuPerfil.isla.objetos[i].desbloqueado = false;
                    }
                }
            }
        }
        existeMenuPerfil.comidas_completadas = completadas;
        existeMenuPerfil.comidas_falladas = falladas;
        existeMenuPerfil.puntos_obtenidos = totalPuntos;
        existeMenuPerfil.eficacia = eficacia;
        const menu = new MenuPerfil(existeMenuPerfil);
        await menu.save();

        let cantidad = 0;
        [menusPerfil, tot] = await Promise.all([
            MenuPerfil.find({ perfil_id: existeMenuPerfil.perfil_id }),
            Perfil.countDocuments({ perfil_id: existeMenuPerfil.perfil_id }),
        ]);

        for (let i = 0; i < menusPerfil.length; i++) {
            cantidad = cantidad + menusPerfil[i].puntos_obtenidos;
        }
        const peerfil = await Perfil.findById(existeMenuPerfil.perfil_id);
        peerfil.puntos_ganados = cantidad;
        await peerfil.save();

        res.json({
            ok: true,
            msg: 'Menu-perfil actualizado',
            existeMenuPerfil
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            ok: false,
            msg: 'Error al actualizar menu-perfil'
        });
    }
}

const actualizarPuntos = async(req, res = response) => {
    const id = req.params.id;
    const desayuno = req.body.desayuno;
    const almuerzo = req.body.almuerzo;
    const comida = req.body.comida;
    const merienda = req.body.merienda;
    const cena = req.body.cena;
    try {
        const menuPerfil = await MenuPerfil.findById(id);
        if (!menuPerfil) {
            return res.status(500).json({
                ok: false,
                msg: 'MenuPerfil no existe'
            });
        }

        Object.entries(menuPerfil.menusem.toObject()).forEach(([dia, valor]) => {
            menuPerfil.menusem[dia].comidas.desayuno.puntos = desayuno;
            menuPerfil.menusem[dia].comidas.almuerzo.puntos = almuerzo;
            menuPerfil.menusem[dia].comidas.comida.puntos = comida;
            menuPerfil.menusem[dia].comidas.merienda.puntos = merienda;
            menuPerfil.menusem[dia].comidas.cena.puntos = cena;

        });
        menuPerfil.save();
        res.json({
            ok: true,
            msg: 'Puntos actualizados',
            menuPerfil
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando puntos de menu-perfil'
        });
    }
}

const comidasCompletadas = async(req, res = response) => {
    const id = req.params.id;
    try {
        const existePerfil = await Perfil.findById(id);
        if (!existePerfil) {
            return res.status(500).json({
                ok: false,
                msg: 'El perfil no existe'
            });
        }
        let menus, total;
        let totalComidas, totalCompletadas = 0;
        [menus, total] = await Promise.all([
            MenuPerfil.find({ perfil_id: id }),
            MenuPerfil.countDocuments({ perfil_id: id }),
        ]);
        for (let i = 0; i < menus.length; i++) {
            totalCompletadas = totalCompletadas + menus[i].comidas_completadas;
        }
        totalComidas = 5 * 7 * menus.length;
        let porcentaje = totalCompletadas / totalComidas;
        if (!Number.isInteger(porcentaje)) {
            porcentaje = Number.parseFloat(porcentaje).toFixed(2) * 100;
        }

        res.json({
            ok: true,
            msg: 'Porcentaje Comidas completadas',
            porcentaje
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error calculando total comidas completadas'
        });
    }
}

const cambiarPlato = async(req, res = response) => {
    const idMenu = req.params.idmp;
    const dia = req.query.dia;
    const comida = req.query.comida;
    const idPlato = req.query.plato;
    const idPlatoNuevo = req.query.nuevo_plato;
    const fechaMenu = new Date(req.query.fechaMenu);
    let platoNuevo;
    try {
        const existeMenuPerfil = await MenuPerfil.findById(idMenu);
        if (!existeMenuPerfil) {
            return res.status(500).json({
                ok: false,
                msg: 'MenuPerfil no existe'
            });
        }
        const perfil = await Perfil.findById(existeMenuPerfil.perfil_id);
        const existePlato = await Plato.findById(idPlatoNuevo);
        if (!existePlato) {
            return res.status(500).json({
                ok: false,
                msg: 'No existe el nuevo plato'
            });
        } else {
            if (existePlato.usuario_id && !existePlato.usuario_id.equals(perfil.usuario)) {
                return res.status(500).json({
                    ok: false,
                    msg: 'El nuevo plato no pertenece al padre de este perfil'
                });
            }
        }
        if (idPlato === "0") { //Si no habia plato anterior (solo se quiere insertar uno)
            for (let i = 0; i < existeMenuPerfil.menusem[dia].comidas[comida].platos.length; i++) {
                const existePlatoPerfil = await PlatoPerfil.findById(existeMenuPerfil.menusem[dia].comidas[comida].platos[i].plato);
                if (idPlatoNuevo == existePlatoPerfil.plato_id) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Ese plato ya está incluido en la comida, pruebe otro'
                    });
                }
            }
            platoNuevo = await crearPlatoPerfil(idPlatoNuevo, perfil._id, dia, comida, fechaMenu);
            existeMenuPerfil.menusem[dia].comidas[comida].platos.push({ "plato": platoNuevo._id });
            await existeMenuPerfil.save();
        } else {
            for (let i = 0; i < existeMenuPerfil.menusem[dia].comidas[comida].platos.length; i++) {
                const existePlatoPerfil = await PlatoPerfil.findById(existeMenuPerfil.menusem[dia].comidas[comida].platos[i].plato);
                if (idPlatoNuevo == existePlatoPerfil.plato_id) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Ese plato ya está incluido en la comida, pruebe otro'
                    });
                }
            }
            let numo = existeMenuPerfil.menusem[dia].comidas[comida].platos.length;

            //Se recorren los platos
            for (let i = 0; i < numo; i++) {
                const pperfil = await PlatoPerfil.findById(existeMenuPerfil.menusem[dia].comidas[comida].platos[i].plato);
                if (pperfil) {
                    if (pperfil._id.equals(idPlato)) {

                        //Encontramos el plato a eliminar 
                        //Se recorren los info_plato del plato_perfil
                        for (let l = 0; l < pperfil.info_plato.length; l++) {
                            let valor = pperfil.info_plato[l];
                            let fecha = existeMenuPerfil.menusem[dia].fecha;
                            if (fecha.getDay() === valor.fecha.getDay() && fecha.getMonth() === valor.fecha.getMonth() &&
                                fecha.getFullYear() === valor.fecha.getFullYear() && comida === valor.comida) {
                                if (pperfil.info_plato.length > 1) {
                                    pperfil.info_plato.splice(l, 1);
                                    await pperfil.save();
                                } else {
                                    await borrarPlato(pperfil.info_plato[l]._id);
                                }
                            }
                        }
                        platoNuevo = await crearPlatoPerfil(idPlatoNuevo, perfil._id, dia, comida, fechaMenu);
                        existeMenuPerfil.menusem[dia].comidas[comida].platos[i].plato = platoNuevo._id;
                        existeMenuPerfil.menusem[dia].comidas[comida].platos[i].completado = false;
                        existeMenuPerfil.menusem[dia].comidas[comida].platos[i].fallado = false;
                        await existeMenuPerfil.save();
                    }
                }
            }
        }

        res.json({
            ok: true,
            msg: 'Plato cambiado',
            existeMenuPerfil,
            platoNuevo
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error cambiando plato de menu-perfil'
        });
    }
}

// esta funcion tendria que llamar a borrar plato-perfil y borrar todos los relacionados con este menu
const borrarMenuPerfil = async(id) => {
    try {
        const existeMenuPerfil = await MenuPerfil.findById(id);
        if (!existeMenuPerfil) {
            return res.status(500).json({
                ok: false,
                msg: 'El menú-perfil no existe'
            });
        }
        let data = fs.readFileSync('../frontend/src/assets/json/elementos.json', 'utf8');
        let jsondat = JSON.parse(data);
        for (let x = 0; x < 7; x++) {
            let dia = jsondat[4].elementos[x].propiedad;
            let fecha = existeMenuPerfil.menusem[dia].fecha;
            for (let z = 0; z < 5; z++) {
                let comida = jsondat[2].elementos[z].propiedad;
                let numo = existeMenuPerfil.menusem[dia].comidas[comida].platos.length;
                for (let i = 0; i < numo; i++) {
                    const pperfil = await PlatoPerfil.findById(existeMenuPerfil.menusem[dia].comidas[comida].platos[i].plato);
                    if (pperfil) {
                        for (let l = 0; l < pperfil.info_plato.length; l++) {
                            let valor = pperfil.info_plato[l];
                            if (fecha.getDay() === valor.fecha.getDay() && fecha.getMonth() === valor.fecha.getMonth() &&
                                fecha.getFullYear() === valor.fecha.getFullYear() && comida === valor.comida) {
                                const respuesta = await borrarPlato(pperfil.info_plato[l]._id);
                            }
                        }
                    }
                }
            }
        }
        const resultado = await MenuPerfil.findByIdAndRemove(id);
    } catch (error) {
        console.error(error);
    }
}


const platosMenuActualChatbot = (diaABuscar, comidaABuscar, perfilId) => {
    return new Promise(async(resolve, reject) => {
        try {

            const menus = await MenuPerfil.find({ perfil_id: perfilId }).sort({ semana: 1 }).populate(populateMenuPerfil);
            const platosEncontrados = [];
            const menuActual = menus.length - 2;

            // Recorre los dias (lunes, martes, miercoles, jueves, viernes, sabado, domingo)
            Object.entries(menus[menuActual].menusem.toObject()).forEach(([dia, datosDia]) => {
                // Recorre las comidas de cada día (desayuno, almuerzo, comida, merienda, cena)
                Object.entries(datosDia.comidas).forEach(([comida, datosComida]) => {
                    datosComida.platos.forEach(plato => {
                        // Comprueba si X día, en X comida existe un plato con el nombre que se pasa por parámetro
                        if (dia == diaABuscar && comida == comidaABuscar.toLowerCase()) {
                            platosEncontrados.push(plato.plato.plato_id.nombre);
                        }
                    });
                });
            });

            resolve(platosEncontrados);
        } catch (error) {
            reject(error);
        }
    });
}

const comprobarPlatoMenuActualChatbot = (diaABuscar, comidaABuscar, platoABuscar, perfilId) => {
    return new Promise(async(resolve, reject) => {
        try {

            const menus = await MenuPerfil.find({ perfil_id: perfilId }).sort({ semana: 1 }).populate(populateMenuPerfil);
            const menuActual = menus.length - 2;

            const platoEncontrado = {
                encontrado: false,
                dia: '',
                comida: '',
                plato: {}
            }

            // Recorre los dias (lunes, martes, miercoles, jueves, viernes, sabado, domingo)
            Object.entries(menus[menuActual].menusem.toObject()).forEach(([dia, datosDia]) => {
                // Recorre las comidas de cada día (desayuno, almuerzo, comida, merienda, cena)
                Object.entries(datosDia.comidas).forEach(([comida, datosComida]) => {
                    datosComida.platos.forEach(plato => {
                        // Comprueba si X día, en X comida existe un plato con el nombre que se pasa por parámetro
                        if (dia == diaABuscar && comida == comidaABuscar.toLowerCase()) {
                            let seEncuentraPlato = new RegExp(platoABuscar, 'i').test(plato.plato.plato_id.nombre);
                            if (seEncuentraPlato) {
                                platoEncontrado.encontrado = true;
                                platoEncontrado.dia = dia;
                                platoEncontrado.comida = comida;
                                platoEncontrado.plato = plato.plato.plato_id;
                            }
                        }
                    });
                });
            });

            resolve(platoEncontrado);
        } catch (error) {
            console.error(error);
            reject(error);
        }

    });
}

const cambiarPlatoPorOtroChatbot = (diaABuscar, comidaABuscar, nombrePlatoACambiar, perfilId, idPlatoNuevo) => {

    return new Promise(async(resolve, reject) => {
        try {

            const menus = await MenuPerfil.find({ perfil_id: perfilId }).sort({ semana: 1 });
            const menuActual = menus.length - 2;
            const menu = await MenuPerfil.findById(menus[menuActual]._id).populate(populateMenuPerfil);
            const fechaMenu = new Date(menu.menusem.lunes.fecha);

            const existePlato = await Plato.findById(idPlatoNuevo);
            const perfil = await Perfil.findById(perfilId);
            if (!existePlato) {
                return res.status(500).json({
                    ok: false,
                    msg: 'No existe el nuevo plato'
                });
            } else {
                if (existePlato.usuario_id && !existePlato.usuario_id.equals(perfil.usuario)) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'El nuevo plato no pertenece al padre de este perfil'
                    });
                }
            }

            // Se recorren los platos
            for (let i = 0; i < menu.menusem[diaABuscar].comidas[comidaABuscar].platos.length; i++) {

                const pperfilAnterior = await PlatoPerfil.findById(menu.menusem[diaABuscar].comidas[comidaABuscar].platos[i].plato._id);
                let seEncuentraPlato = new RegExp(nombrePlatoACambiar, 'i').test(menu.menusem[diaABuscar].comidas[comidaABuscar].platos[i].plato.plato_id.nombre);
                if (seEncuentraPlato) {
                    //Encontramos el plato a eliminar 
                    //Se recorren los info_plato del plato_perfil para eliminar el que corresponde al cambio
                    for (let l = 0; l < pperfilAnterior.info_plato.length; l++) {
                        let valor = pperfilAnterior.info_plato[l];
                        let fecha = menu.menusem[diaABuscar].fecha;
                        if (fecha.getDay() === valor.fecha.getDay() && fecha.getMonth() === valor.fecha.getMonth() &&
                            fecha.getFullYear() === valor.fecha.getFullYear() && comidaABuscar === valor.comida) {
                            if (pperfilAnterior.info_plato.length > 1) {
                                pperfilAnterior.info_plato.splice(l, 1);
                                await pperfilAnterior.save();
                            } else {
                                await borrarPlato(pperfilAnterior.info_plato[l]._id);
                            }
                        }
                    }
                    const respuesta = await crearPlatoPerfil(idPlatoNuevo, perfil._id, diaABuscar, comidaABuscar, fechaMenu);
                    menu.menusem[diaABuscar].comidas[comidaABuscar].platos[i].plato = respuesta._id;
                    menu.menusem[diaABuscar].comidas[comidaABuscar].platos[i].completado = false;
                    menu.menusem[diaABuscar].comidas[comidaABuscar].platos[i].fallado = false;
                    await menu.save();

                }
            }
            resolve(true);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}


const getMesesDeLaSemanaActual = (fecha) => {
    const fechaActual = new Date(fecha.getTime());
    const diaSemana = fechaActual.getDay();
    let diasRestantes = 7 - diaSemana;
    const meses = [];
    var mesesDefinitivos = [];

    // Si no es domingo
    if (diasRestantes !== 7) {

        for (let i = 0; i < diasRestantes; i++) {
            let fechaAux = fechaActual;
            fechaAux.setDate(fechaActual.getDate() + i);
            meses.push(fechaAux.getMonth());
        }

        // Eliminar meses duplicados
        for (let i = 0; i < meses.length; i++) {
            if (mesesDefinitivos.indexOf(meses[i]) === -1) {
                mesesDefinitivos.push(meses[i]);
            }
        }

    } else {
        mesesDefinitivos[0] = fechaActual.getMonth();
    }

    return mesesDefinitivos;
}


const obtenerMenuChatbot = (diaABuscar, perfilId) => {
    return new Promise(async(resolve, reject) => {
        try {

            let menuDia = [];
            const menus = await MenuPerfil.find({ perfil_id: perfilId }).sort({ semana: 1 }).populate(populateMenuPerfil);
            const menuActual = menus.length - 2;

            const comida = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'];

            for (let i = 0; i < comida.length; i++) {
                for (let j = 0; j < menus[menuActual].menusem[diaABuscar]['comidas'][comida[i]]['platos'].length; j++) {
                    menuDia.push([comida[i], menus[menuActual].menusem[diaABuscar]['comidas'][comida[i]]['platos'][j].plato.plato_id]);
                }
            }
            resolve(menuDia);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    obtenerMenuPerfil,
    obtenerComidasHoy,
    obtenerComidasNoCompletadasMenuPerfil,
    crearMenuPerfil,
    actualizarMenuPerfil,
    actualizarPuntos,
    cambiarPlato,
    comidasCompletadas,
    borrarMenuPerfil,
    platosMenuActualChatbot,
    comprobarPlatoMenuActualChatbot,
    cambiarPlatoPorOtroChatbot,
    obtenerMenuChatbot,
    addComida,
    getNumeroSemana,
    getMesesDeLaSemanaActual
};