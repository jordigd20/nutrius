const { response } = require("express");
const SeguimientoPesoYAltura = require('../models/seguimiento-peso');
const Perfil = require('../models/perfiles');

const obtenerRegistrosPesoAltura = async(req, res = response) => {
    const pid = req.params.pid;
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    try {

        [listaSeguimiento, total] = await Promise.all([
            SeguimientoPesoYAltura.find({ pid }).sort({ fecha: -1 }).skip(desde).limit(registropp),
            SeguimientoPesoYAltura.find({ pid }).countDocuments()
        ]);

        res.json({
            ok: true,
            msg: "obtenerRegistrosPesoAltura",
            seguimiento: listaSeguimiento,
            page: {
                desde,
                registropp,
                total,
            },
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al registrar el peso y la altura'
        });

    }
}

const registrarPesoAltura = async(req, res = response) => {
    const id = req.params.pid;
    const { fecha, peso, altura } = req.body;

    try {
        // Busca el ultimo seguimiento registrado del perfil pasado por parámetro
        [ultimoSeguimiento, perfil] = await Promise.all([
            SeguimientoPesoYAltura.findOne({ id, fecha: { $lt: new Date(fecha) } }).sort({ fecha: -1 }),
            Perfil.findById(id)
        ]);

        if (!perfil) {
            throw new Error('No existe el perfil');
        }

        const totalRegistros = await SeguimientoPesoYAltura.find({ pid: id });
        if (totalRegistros.length === 0) {
            req.body.variacion = 0;
        } else {
            if (ultimoSeguimiento) {
                let variacion = peso - ultimoSeguimiento.peso;
                if (!Number.isInteger(variacion)) {
                    variacion = Number.parseFloat(variacion).toFixed(2);
                }
                req.body.variacion = variacion;
            }
        }

        req.body.pid = id;
        if (perfil.peso_objetivo != -1) {
            let difObjetivo = Math.abs(peso - perfil.peso_objetivo);
            if (!Number.isInteger(difObjetivo)) {
                difObjetivo = Number.parseFloat(difObjetivo).toFixed(2);
            }
            req.body.difObjetivo = difObjetivo;
        } else {
            req.body.difObjetivo = null;
        }

        const seguimiento = new SeguimientoPesoYAltura(req.body);
        await seguimiento.save();

        await Perfil.findByIdAndUpdate(id, { peso_actual: peso, altura_actual: altura }, { new: true });

        res.json({
            ok: true,
            seguimiento,
            msg: "registrarPesoAltura"
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al registrar el peso y la altura'
        });
        console.error(error);
    }
}

const registrarPesoAlturaChatbot = (fecha, peso, altura, perfilId) => {
    return new Promise(async(resolve, reject) => {
        const datosSeguimiento = { pid: perfilId, fecha, peso, altura }
        try {
            [ultimoSeguimiento, perfil] = await Promise.all([
                SeguimientoPesoYAltura.findOne({ pid: perfilId, fecha: { $lt: fecha } }).sort({ fecha: -1 }),
                Perfil.findById(perfilId)
            ]);

            if (!perfil) {
                throw new Error('No existe el perfil');
            }
            
            const totalRegistros = await SeguimientoPesoYAltura.find({ pid: perfilId });

            if (totalRegistros.length === 0) {
                datosSeguimiento.variacion = 0;
            } else {
                if (ultimoSeguimiento) {
                    let variacion = peso - ultimoSeguimiento.peso;
                    if (!Number.isInteger(variacion)) {
                        variacion = Number.parseFloat(variacion).toFixed(2);
                    }
                    datosSeguimiento.variacion = variacion;
                }
            }

            if (perfil.peso_objetivo != -1) {
                let difObjetivo = Math.abs(peso - perfil.peso_objetivo);
                if (!Number.isInteger(difObjetivo)) {
                    difObjetivo = Number.parseFloat(difObjetivo).toFixed(2);
                }
                datosSeguimiento.difObjetivo = difObjetivo;
            } else {
                datosSeguimiento.difObjetivo = null;
            }

            const seguimiento = new SeguimientoPesoYAltura(datosSeguimiento);
            await seguimiento.save();

            await Perfil.findByIdAndUpdate(perfilId, { peso_actual: peso, altura_actual: altura }, { new: true });

            resolve(seguimiento);
        } catch (error) {
            reject(error);
        }
    });
}

const descargarSeguimientoChatbot = (seccion, perfilId) => {
    return new Promise(async(resolve, reject) => {
        try {} catch (error) {
            reject(error);
        }
    });
}

const borrarSeguimiento = async(uid) => {
    try {
        const existeSeguimiento = await SeguimientoPesoYAltura.findById(uid);

        if (!existeSeguimiento) {
            return res.status(500).json({
                ok: true,
                msg: 'El seguimiento no existe'
            });
        }
        const resultado = await SeguimientoPesoYAltura.findByIdAndRemove(uid);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    obtenerRegistrosPesoAltura,
    registrarPesoAltura,
    registrarPesoAlturaChatbot,
    descargarSeguimientoChatbot,
    borrarSeguimiento
};