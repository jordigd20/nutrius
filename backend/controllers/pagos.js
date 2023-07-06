const { response } = require("express");
const Premium = require('../models/premium');
const Usuario = require('../models/usuarios');
const axios = require('axios');
require('dotenv').config();

const crearPagoPaypal = async(req, res = response) => {
    const { plan } = req.body;
    try {
        let precio = 0;
        let descripcion = '';
        let idPlan = 0;
        switch (plan) {
            case '1 mes':
                descripcion = 'Plan premium por 1 mes';
                precio = 3.99;
                idPlan = 1;
                break;
            case '3 meses':
                descripcion = 'Plan premium por 3 meses';
                precio = 8.99;
                idPlan = 2;
                break;
            case '6 meses':
                descripcion = 'Plan premium por 6 meses';
                precio = 12.99;
                idPlan = 3;
                break;
            case '1 año':
                descripcion = 'Plan premium por 1 año';
                precio = 18.99;
                idPlan = 4;
                break;
            default:
                break;
        }

        if (precio === 0) {
            return res.status(400).json({
                msg: 'Plan incorrecto',
                ok: false,
            });
        }

        const return_url = process.env.NODE_ENV === 'produccion' ? 'https://nutrius.ovh/inicio/validar-pago' : 'http://localhost:4200/inicio/validar-pago';
        const cancel_url = process.env.NODE_ENV === 'produccion' ? `https://nutrius.ovh/inicio/facturacion/${idPlan}` : `http://localhost:4200/inicio/facturacion/${idPlan}`;

        const order = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'EUR',
                    value: precio
                },
                description: descripcion
            }],
            application_context: {
                brand_name: 'NutriUs',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
                return_url,
                cancel_url
            }
        }

        const access_token = await generarAccessTokenPaypal();

        const respuesta = await axios.post(`${process.env.PAYPAL_API}/v2/checkout/orders`, order, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        res.json({
            msg: 'crear-pago-paypal',
            ok: true,
            link: respuesta.data.links[1]
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error creando el pago de Paypal'
        });
    }

}

const capturarPagoPaypal = async(req, res = response) => {
    const { token, PayerID } = req.query;

    try {
        const access_token = await generarAccessTokenPaypal();
        const respuesta = await axios.post(`${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`, {}, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const precio = respuesta.data.purchase_units[0].payments.captures[0].amount.value;
        res.json({
            msg: 'capturarPagoPaypal',
            ok: true,
            precio,
            status: respuesta.data.status,
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error validando el pago de Paypal'
        });
    }
}

const getPagoPaypal = async(req, res = response) => {
    const { id } = req.query;

    try {
        const access_token = await generarAccessTokenPaypal();

        const respuesta = await axios.get(`${process.env.PAYPAL_API}/v1/billing/subscriptions/${id}`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const precio = respuesta.data.billing_info.last_payment.amount.value;
        res.json({
            msg: 'getPagoPaypal',
            ok: true,
            precio,
            status: respuesta.data.status,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error validando el pago de Paypal'
        });
    }
}

const cancelarSubscripcionPaypal = async(req, res = response) => {
    const { id } = req.query;

    try {
        const access_token = await generarAccessTokenPaypal();

        const respuesta = await axios.post(`${process.env.PAYPAL_API}/v1/billing/subscriptions/${id}/cancel`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        res.json({
            msg: 'Subscripción de paypal cancelada correctamente',
            ok: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error validando el pago de Paypal'
        });
    }
}

const paypalWebhook = async(req, res = response) => {
    try {

        // Buscar la subscripcion por ID y cancelarle el rol premium al usuario que la tenga
        if (req.body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
            const subscripcion_id = req.body.resource.id;

            const plan_premium = await Premium.findOne({ subscripcion_id });

            if (!plan_premium) {
                return res.status(400).json({
                    msg: 'No existe un plan premium con ese subscripcion_id',
                    ok: false
                })
            }

            await Premium.findByIdAndUpdate(plan_premium._id, { activo: false }, { new: true });
            await Usuario.findByIdAndUpdate(plan_premium.usuario_id, { premium: false, rol: "ROL_USUARIO" }, { new: true });
        }

        res.json({
            msg: 'paypalWebhook',
            ok: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error en el paypalWebhook'
        });
    }
}

const generarAccessTokenPaypal = async() => {
    return new Promise(async(resolve, reject) => {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');

            const { data: { access_token } } = await axios.post(`${process.env.PAYPAL_API}/v1/oauth2/token`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: process.env.PAYPAL_CLIENT_ID,
                    password: process.env.PAYPAL_API_SECRET
                }
            });

            resolve(access_token);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    crearPagoPaypal,
    capturarPagoPaypal,
    getPagoPaypal,
    paypalWebhook,
    cancelarSubscripcionPaypal,
    generarAccessTokenPaypal
};