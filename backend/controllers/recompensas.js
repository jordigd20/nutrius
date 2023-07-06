const { response } = require('express');
const Recompensa = require('../models/recompensas');
const Perfil = require('../models/perfiles');

const obtenerRecompensas = async(req, res = response) => {
    const id = req.query.id;
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);
    try {
        let recompensas, total;
        if (id) {
            const existePerfil = await Perfil.findById(id);
            const existeRecompensa = await Recompensa.findById(id);
            if (existePerfil) {
                [recompensas, total] = await Promise.all([
                    Recompensa.find({ pid: id }).skip(desde).limit(registropp),
                    Recompensa.countDocuments({ pid: id }),
                ]);
            }
            if (existeRecompensa) {
                recompensas = existeRecompensa;
            }
        } else {
            [recompensas, total] = await Promise.all([
                Recompensa.find({}).skip(desde).limit(registropp),
                Recompensa.countDocuments(),
            ]);
        }

        res.json({
            ok: true,
            msg: "obtenerRecompensas",
            recompensas,
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
            msg: 'Error al obtener las recompensas'
        });
    }
}

const obtenerRecompensasPerfil = async(req, res = response) => {
    const perfil_id = req.params.pid;
    const c = req.params.canjeada;
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);
    try {
        const existenRecompensas = await Recompensa.find({ perfil_id });
        let recompensas = [];

        if (c == 'canjeadas') {
            [recompensas, total] = await Promise.all([
                Recompensa.find({ canjeada: true, pid: perfil_id }).sort({ puntos: 1 }).skip(desde).limit(registropp),
                Recompensa.countDocuments({ canjeada: true, pid: perfil_id }),
            ]);
        } else if (c == 'compradas') {
            [recompensas, total] = await Promise.all([
                Recompensa.find({ canjeada: true, pid: perfil_id }),
                Recompensa.countDocuments({ canjeada: true, pid: perfil_id }),
            ]);
        } else {
            [recompensas, total] = await Promise.all([
                Recompensa.find({ canjeada: false, pid: perfil_id }).sort({ puntos: 1 }).skip(desde).limit(registropp),
                Recompensa.countDocuments({ canjeada: false, pid: perfil_id }),
            ]);
        }
        res.json({
            ok: true,
            msg: "obtenerRecompensasPerfil",
            recompensas,
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
            msg: 'Error al devolver recompensas del perfil'
        });
    }
}

const crearRecompensa = async(req, res = response) => {
    const perfil_id = req.params.pid;

    try {
        req.body.pid = perfil_id;
        const recompensa = new Recompensa(req.body);

        await recompensa.save();

        res.json({
            ok: true,
            msg: 'Recompensa creada',
            recompensa,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear recompensa'
        });
    }
}

const actualizarRecompensa = async(req, res = response) => {
    const uid = req.params.id;
    const canje = req.body.canjeada || '';
    try {

        const existeRecompensa = await Recompensa.findById(uid);

        if (!existeRecompensa) {
            return res.status(500).json({
                ok: false,
                msg: 'La recompensa no existe'
            });
        } else {
            if (existeRecompensa.canjeada === false) {
                if (canje !== '' && canje === true) {
                    const perfil = await Perfil.findById(existeRecompensa.pid);
                    if (perfil) {
                        const p = perfil.puntos_ganados - existeRecompensa.puntos;
                        if (p > 0) {
                            await Perfil.findByIdAndUpdate(existeRecompensa.pid, { puntos_ganados: p }, { new: true });
                        } else {
                            req.body.canjeada = false;
                        }
                    }
                }
            }
        }
        const recompensa = await Recompensa.findByIdAndUpdate(uid, req.body, { new: true });

        res.json({
            ok: true,
            msg: 'Recompensa actualizada',
            recompensa
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando recompensa'
        });
    }
}

const borrarRecompensa = async(req, res = response) => {
    const uid = req.params.id;

    try {
        const existeRecompensa = await Recompensa.findById(uid);

        if (!existeRecompensa) {
            return res.status(500).json({
                ok: true,
                msg: 'La recompensa no existe'
            });
        }
        const resultado = await Recompensa.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Recompensa eliminada',
            resultado: resultado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando recompensa'
        });
    }
}
const borrarRecompensa2 = async(uid) => {
    try {
        const existeRecompensa = await Recompensa.findById(uid);

        if (!existeRecompensa) {
            return res.status(500).json({
                ok: true,
                msg: 'La recompensa no existe'
            });
        }
        const resultado = await Recompensa.findByIdAndRemove(uid);
    } catch (error) {
        console.error(error);
    }
}

const crearRecompensaChatbot = (recompensa, puntos, perfilId) => {
    return new Promise(async(resolve, reject) => {
        try {

            const nuevaRecompensa = new Recompensa({
                pid: perfilId,
                nombre: recompensa,
                puntos: puntos
            });
            await nuevaRecompensa.save();

            resolve(nuevaRecompensa);

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    obtenerRecompensas,
    obtenerRecompensasPerfil,
    crearRecompensa,
    actualizarRecompensa,
    borrarRecompensa,
    borrarRecompensa2,
    crearRecompensaChatbot
};