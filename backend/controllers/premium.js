const { response } = require("express");
const Premium = require('../models/premium');
const Usuario = require('../models/usuarios');
const { generarAccessTokenPaypal } = require('../controllers/pagos');
const axios = require('axios');
require('dotenv').config();

// se le pasa por parámetro el id del usuario
const obtenerPlanPremium = async(req, res = response) => {
    const usuario_id = req.params.pid;
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    try {
        let planes, total;

        // se comprueba que existe el usuario con el id pasado por parametro
        const existeUsuario = await Usuario.findById(usuario_id);

        if (!existeUsuario) {
            res.status(400).json({
                ok: false,
                msg: 'El usuario no existe'
            });
        }
        // se comprueba que exista un plan premium para el usuario con 
        // el id pasado por parametro
        const planPremium = await Premium.findOne({ usuario_id });
        if (!planPremium) {
            res.status(400).json({
                ok: false,
                msg: 'El usuario no tiene ningún plan premium'
            });
        } else {
            let query = { usuario_id: usuario_id };
            [planes, total] = await Promise.all([
                Premium.find(query).skip(desde).limit(registropp)
                .collation({ locale: "es" })
                .sort({ fecha_inicio: 1 }),
                Premium.countDocuments(query),
            ]);
            res.json({
                ok: true,
                msg: "obtenerPlanPremium",
                planes,
                page: {
                    desde,
                    registropp,
                    total,
                },
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener el plan Premium'
        });
    }
}

// se le pasa por parámetro el id del usuario
const crearUsuarioPremium = async(req, res = response) => {
    const usuario_id = req.params.pid;
    try {
        //se comprueba que existe el usuario
        const existeUsuario = await Usuario.findById(usuario_id);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe, no puede crear una plan Premium'
            });
        }

        req.body.usuario_id = usuario_id;

        //Se crea el plan y se actualizan los datos según el plan escogido
        const planPremium = new Premium(req.body);
        switch (req.body.plan) {
            case '1 mes':
                planPremium.duracion = 30;
                planPremium.precio = 3.99;
                break;
            case '3 meses':
                planPremium.duracion = 90;
                planPremium.precio = 8.99;
                break;
            case '6 meses':
                planPremium.duracion = 180;
                planPremium.precio = 12.99;
                break;
            case '1 año':
                planPremium.duracion = 365;
                planPremium.precio = 18.99;
                break;
            default:
                break;
        }
        //Se guarda la fecha actual (en la que se crea el plan) como fecha de inicio
        planPremium.fecha_inicio = new Date();

        planPremium.activo = true;

        await planPremium.save();

        await Usuario.findByIdAndUpdate(existeUsuario, { premium: true, rol: "ROL_PREMIUM" }, { new: true });

        res.json({
            ok: true,
            msg: 'Plan premium creado',
            planPremium
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            msg: 'Error al crear plan premium'
        });
    }
}

//Se pasa por parámetro el id del plan premium
const actualizarUsuarioPremium = async(req, res = response) => {
    const id = req.params.id;

    try {
        const existePremium = await Premium.findById(id);

        if (!existePremium) {
            return res.status(500).json({
                ok: false,
                msg: 'El plan premium no existe'
            });
        }

        switch (req.body.plan) {
            case '1 mes':
                req.body.duracion = 30;
                req.body.precio = 3.99;
                break;
            case '3 meses':
                req.body.duracion = 90;
                req.body.precio = 8.99;
                break;
            case '6 meses':
                req.body.duracion = 180;
                req.body.precio = 12.99;
                break;
            case '1 año':
                req.body.duracion = 365;
                req.body.precio = 18.99;
                break;
            default:
                break;
        }
        const premium = await Premium.findByIdAndUpdate(id, req.body, { new: true });

        res.json({
            ok: true,
            msg: 'Plan premium actualizado',
            premium
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando el plan premium'
        })
    }
}

// se pone variable activo a false
const cancelarPremium = async(req, res = response) => {
    const uid = req.params.id;
    const { subscripcion_id } = req.body;

    try {
        const existePremium = await Premium.findById(uid);

        if (!existePremium) {
            return res.status(500).json({
                ok: false,
                msg: 'El plan premium no existe'
            });
        }

        if (existePremium.metodo_pago === 2) {
            const access_token = await generarAccessTokenPaypal();

            const respuesta = await axios.post(`${process.env.PAYPAL_API}/v1/billing/subscriptions/${subscripcion_id}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
        }

        req.body.activo = false;
        const resultado = await Premium.findByIdAndUpdate(uid, req.body, { new: true });
        await Usuario.findByIdAndUpdate(existePremium.usuario_id, { premium: false, rol: "ROL_USUARIO" }, { new: true });

        res.json({
            ok: true,
            msg: 'Plan Premium cancelado',
            resultado: resultado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error cancelando plan premium'
        });
    }
}

//se pasa por parametro el id del plan premium a borrar
const borrarPremium = async(req, res = response) => {
    const uid = req.params.id;

    try {
        const existePremium = await Premium.findById(uid);

        if (!existePremium) {
            return res.status(500).json({
                ok: false,
                msg: 'El plan premium no existe'
            });
        }

        const resultado = await Premium.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Plan Premium eliminado',
            resultado: resultado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando plan premium'
        });
    }
}

module.exports = {
    obtenerPlanPremium,
    crearUsuarioPremium,
    actualizarUsuarioPremium,
    cancelarPremium,
    borrarPremium
};