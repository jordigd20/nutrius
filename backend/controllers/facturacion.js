const { response } = require("express");
const Facturacion = require('../models/facturacion');
const Usuario = require('../models/usuarios');

// se le pasa por parametro el uid
const obtenerFactura = async(req, res = response) => {
    const uid = req.params.id;

    try {
        const existeUsuario = await Usuario.findById(uid);

        if (existeUsuario) {
            let factura;
            factura = await Facturacion.findOne({ uid });
            res.json({
                ok: true,
                msg: "obtenerFactura",
                factura
            });
        } else {
            res.status(500).json({
                ok: false,
                msg: 'Error al obtener la factura del usuario'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la factura'
        });
    }
}

// se le pasa por parametro el uid
const crearFactura = async(req, res = response) => {
    const usuario_id = req.params.id;
    try {
        const existeUsuario = await Usuario.findById(usuario_id);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe, no puede crear una factura'
            });
        }

        req.body.uid = usuario_id;
        const { uid } = req.body;
        const existeFactura = await Facturacion.findOne({ uid });

        if (existeFactura) {
            return res.status(400).json({
                ok: false,
                msg: 'Existe una factura para este usuario'
            });
        }

        const factura = new Facturacion(req.body);

        await factura.save();

        res.json({
            ok: true,
            msg: 'Factura creada',
            factura
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'Error al crear factura'
        });
    }
}

const actualizarFactura = async(req, res = response) => {
    const id = req.params.id;

    try {
        const existeFactura = await Facturacion.findById(id);

        if (!existeFactura) {
            return res.status(500).json({
                ok: false,
                msg: 'La factura no existe'
            });
        }

        const factura = await Facturacion.findByIdAndUpdate(id, req.body, { new: true });

        res.json({
            ok: true,
            msg: 'Factura actualizada',
            factura
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando factura'
        })
    }
}

const borrarFactura = async(req, res = response) => {
    const uid = req.params.id;

    try {
        const existeFactura = await Facturacion.findById(uid);

        if (!existeFactura) {
            return res.status(500).json({
                ok: false,
                msg: 'La factura no existe'
            });
        }

        const resultado = await Facturacion.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Factura eliminada',
            resultado: resultado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando factura'
        });
    }
}

module.exports = {
    obtenerFactura,
    crearFactura,
    actualizarFactura,
    borrarFactura
};