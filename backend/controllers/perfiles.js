const { response } = require("express");
const Perfil = require('../models/perfiles');
const Usuario = require("../models/usuarios");
const MenuPerfil = require("../models/menu_perfil");
const Recompensa = require("../models/recompensas");
const SeguimientoPesoYAltura = require("../models/seguimiento-peso");
const { borrarRecompensa2 } = require("../controllers/recompensas");
const { borrarMenuPerfil } = require('../controllers/menu_perfil');
const { borrarSeguimiento } = require('../controllers/seguimiento');

const obtenerPerfil = async(req, res = response) => {
    const id = req.params.pid;
    try {
        const existePerfil = await Perfil.findById(id);
        if (!existePerfil) {
            return res.status(400).json({
                ok: false,
                msg: 'El perfil no existe'
            });
        }
        res.json({
            ok: true,
            msg: "obtenerPerfil",
            existePerfil
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener el perfil'
        });
    }
}

const obtenerPerfiles = async(req, res = response) => {
    const id = req.query.id || "";
    const desde = Number(req.query.desde) || 0;
    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }
    const usuario = req.query.usuario || '';

    try {
        let perfiles, total;

        if (id) {
            [perfiles, total] = await Promise.all([
                Perfil.findById(id),
                Perfil.countDocuments(),
            ]);
        } else {

            let query = {};

            if (usuario !== '') {
                query = { 'usuario': usuario };
            } else {
                query = {};
            }

            [perfiles, total] = await Promise.all([
                Perfil.find(query).skip(desde).limit(registropp),
                Perfil.countDocuments(query),
            ]);
        }

        res.json({
            ok: true,
            msg: "obtenerPerfiles",
            perfiles,
            page: {
                desde,
                registropp,
                total,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los perfiles'
        });
    }
}

const obtenerPerfilesUsuario = async(req, res = response) => {
    const id = req.params.id;
    const usuario = req.query.usuario || '';

    try {
        const existeUsuario = await Usuario.findById(id);
        let perfiles, total;

        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }

        let query = {};

        if (usuario !== '') {
            query = { 'usuario': usuario };
        } else {
            query = {};
        }

        [perfiles, total] = await Promise.all([
            Perfil.find(query),
            Perfil.countDocuments(query),
        ]);

        res.json({
            ok: true,
            msg: "obtenerPerfiles",
            perfiles,
            total
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los perfiles de un usuario'
        });
    }
}

const crearPerfil = async(req, res = response) => {

    const { usuario, ...object } = req.body;
    const name = object.nombre;
    try {
        // Crear perfil nuevo
        const existeUsuario = await Usuario.findById(usuario);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario asignado al perfil no existe'
            });
        }
        for (let i = 0; i < existeUsuario.perfiles.length; i++) {
            const existePerfil = await Perfil.findById(existeUsuario.perfiles[i]);
            if (existePerfil.nombre === name) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El usuario no puede tener dos perfiles con el mismo nombre'
                });
            }
        }
        object.usuario = usuario;
        const perfilNuevo = new Perfil(object);
        await perfilNuevo.save();

        // Asignar perfil a usuario
        const arrayPerfiles = existeUsuario.perfiles;
        arrayPerfiles.push(perfilNuevo._id);

        await Usuario.findByIdAndUpdate(usuario, { perfiles: arrayPerfiles }, { new: true });

        // Añadir peso y altura al registro
        let difObj;
        if (perfilNuevo.peso_objetivo != -1) {
            difObj = Math.abs(perfilNuevo.peso_actual - perfilNuevo.peso_objetivo);
        } else {
            difObj = null;
        }
        var registro = {
            pid: perfilNuevo._id,
            fecha: Date.now(),
            peso: perfilNuevo.peso_actual,
            altura: perfilNuevo.altura_actual,
            variacion: 0,
            difObjetivo: difObj
        }
        const seguimiento = new SeguimientoPesoYAltura(registro);
        await seguimiento.save();

        res.json({
            ok: true,
            msg: 'Perfil creado',
            perfil: perfilNuevo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear perfil'
        });
    }
}

const actualizarPerfil = async(req, res = response) => {
    const object = req.body;
    const uid = req.params.id;
    const usuario = req.body.usuario;
    const name = req.body.nombre;
    try {
        const existeUsuario = await Usuario.findById(usuario);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario asignado al perfil no existe'
            });
        }
        for (let i = 0; i < existeUsuario.perfiles.length; i++) {
            if (existeUsuario.perfiles[i] === name) {
                return res.status(400).json({
                    ok: false,
                    msg: 'El usuario no puede tener dos perfiles con el mismo nombre'
                });
            }
        }
        const perfil = await Perfil.findByIdAndUpdate(uid, object, { new: true });

        res.json({
            ok: true,
            msg: "Perfil actualizado correctamente",
            perfil
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error actualizando perfil",
        });
    }
}

const actualizarAvatar = async(req, res = response) => {
    const pid = req.params.id;
    const av = req.params.a;

    try {
        // Comprobamos si existe el perfil que queremos borrar
        const existePerfil = await Perfil.findById(pid);
        if (!existePerfil) {
            return res.status(400).json({
                ok: true,
                msg: 'El perfil no existe'
            });
        }

        existePerfil.avatar = "../../../assets/img/" + av;

        // Lo actualizamos y devolvemos el perfil con el estado cambiado
        const resultado = await Perfil.findByIdAndUpdate(pid, existePerfil, { new: true });

        res.json({
            ok: true,
            msg: 'Avatar Perfil cambiado',
            resultado: resultado
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error cambiando el avatar del perfil'
        });

    }
}

const updatePuntos = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            let total = 0;
            [menusPerfil, total] = await Promise.all([
                MenuPerfil.find({ perfil_id: id }),
                Perfil.countDocuments({ perfil_id: id }),
            ]);
            for (let i = 0; i < menusPerfil.length; i++) {
                total = total + menusPerfil[i].puntos_obtenidos;
            }
            const perfil = await Perfil.findById(id);
            perfil.puntos_ganados = total;
            await perfil.save();

            resolve(true);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

const borrarPerfil = async(req, res = response) => {

    const uid = req.params.id;

    try {
        // Comprobamos si existe el perfil que queremos borrar
        const existePerfil = await Perfil.findById(uid);
        if (!existePerfil) {
            return res.status(400).json({
                ok: true,
                msg: 'El perfil no existe'
            });
        }

        //Borrarmos todos los menusPerfil
        const menusPerfil = await MenuPerfil.find({ perfil_id: uid });
        for (let i = 0; i < menusPerfil.length; i++) {
            await borrarMenuPerfil(menusPerfil[i]._id);
        }
        const menus = await MenuPerfil.find({ perfil_id: uid });

        //Borramos las recompensas
        const recompensas = await Recompensa.find({ pid: uid });
        for (let i = 0; i < recompensas.length; i++) {
            await borrarRecompensa2(recompensas[i]._id);
        }
        const recom = await Recompensa.find({ pid: uid });

        //Borramos los seguimientos
        const registros = await SeguimientoPesoYAltura.find({ pid: uid });
        for (let i = 0; i < registros.length; i++) {
            await borrarSeguimiento(registros[i]._id);
        }
        const seguimie = await SeguimientoPesoYAltura.find({ pid: uid });

        //Borramos el perfil al usuario
        const usu = await Usuario.findById(existePerfil.usuario);
        for (let i = 0; i < usu.perfiles.length; i++) {
            if (usu.perfiles[i].equals(uid)) {
                await (usu.perfiles).splice(i, 1);
                await usu.save();
            }
        }
        // Lo eliminamos y devolvemos el perfil recien eliminado
        const resultado = await Perfil.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Perfil eliminado',
            resultado: resultado
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error borrando perfil'
        });
    }
}

const borrarPerfil2 = (uid) => {
    return new Promise(async(resolve, reject) => {
        try {
            // Comprobamos si existe el perfil que queremos borrar
            const existePerfil = await Perfil.findById(uid);
            if (!existePerfil) {
                return res.status(400).json({
                    ok: true,
                    msg: 'El perfil no existe'
                });
            }

            //Borrarmos todos los menusPerfil
            const menusPerfil = await MenuPerfil.find({ perfil_id: uid });
            for (let i = 0; i < menusPerfil.length; i++) {
                await borrarMenuPerfil(menusPerfil[i]._id);
            }
            const menus = await MenuPerfil.find({ perfil_id: uid });

            //Borramos las recompensas
            const recompensas = await Recompensa.find({ pid: uid });
            for (let i = 0; i < recompensas.length; i++) {
                await borrarRecompensa2(recompensas[i]._id);
            }
            const recom = await Recompensa.find({ pid: uid });

            //Borramos los seguimientos
            const registros = await SeguimientoPesoYAltura.find({ pid: uid });
            for (let i = 0; i < registros.length; i++) {
                await borrarSeguimiento(registros[i]._id);
            }
            const seguimie = await SeguimientoPesoYAltura.find({ pid: uid });

            //Borramos el perfil al usuario
            const usu = await Usuario.findById(existePerfil.usuario);
            for (let i = 0; i < usu.perfiles.length; i++) {
                if (usu.perfiles[i].equals(uid)) {
                    await (usu.perfiles).splice(i, 1);
                    await usu.save();
                }
            }
            // Lo eliminamos y devolvemos el perfil recien eliminado
            const resultado = await Perfil.findByIdAndRemove(uid);

            resolve(resultado);
        } catch (error) {
            reject(error);
        }
    });
}

const cambiarEstadoPerfil = async(req, res = response) => {
    const uid = req.params.id;

    try {
        // Comprobamos si existe el perfil que queremos borrar
        const existePerfil = await Perfil.findById(uid);
        if (!existePerfil) {
            return res.status(400).json({
                ok: true,
                msg: 'El perfil no existe'
            });
        }

        if (existePerfil.activo) existePerfil.activo = false;
        else existePerfil.activo = true;

        // Lo actualizamos y devolvemos el perfil con el estado cambiado
        const resultado = await Perfil.findByIdAndUpdate(uid, existePerfil, { new: true });

        res.json({
            ok: true,
            msg: 'Estado Perfil cambiado',
            resultado: resultado
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error cambiando el estado del perfil'
        });
    }
}

module.exports = {
    obtenerPerfil,
    obtenerPerfiles,
    obtenerPerfilesUsuario,
    actualizarPerfil,
    actualizarAvatar,
    updatePuntos,
    crearPerfil,
    borrarPerfil,
    borrarPerfil2,
    cambiarEstadoPerfil
};