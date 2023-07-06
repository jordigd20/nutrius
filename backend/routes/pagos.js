const { Router } = require("express");
const router = Router();
const { check } = require("express-validator");
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require("../middleware/validar-campos");
const {
    crearPagoPaypal,
    capturarPagoPaypal,
    getPagoPaypal,
    paypalWebhook,
} = require("../controllers/pagos");

router.post('/crear-pago-paypal', [
    validarJWT,
    check('plan', 'El argumento plan es obligatorio').not().isEmpty().trim(),
    validarCampos,
], crearPagoPaypal);

router.get('/capturar-pago-paypal', [
    validarJWT,
    check('token', 'El argumento token es obligatorio').not().isEmpty(),
    check('PayerID', 'El argumento PayerID es obligatorio').not().isEmpty(),
    validarCampos,
], capturarPagoPaypal);

router.get('/get-pago-paypal', [
    validarJWT,
    check('id', 'El argumento id es obligatorio').not().isEmpty(),
    validarCampos,
], getPagoPaypal);

router.post('/webhook', paypalWebhook);

module.exports = router;