const { Router } = require('express');
const { check } = require('express-validator');
const {
    login,
    token,
    loginGoogle,
    registroGoogle,
    enviarEmail,
    reenviarEmail,
    activateUser
} = require('../controllers/auth.js');
const { validarCampos } = require('../middleware/validar-campos');
const router = Router();

router.get('/token', [
    check("x-token", "El argumento x-token es obligatorio").not().isEmpty(),
    validarCampos,
], token);

router.post("/", [
    check("email", "El argumento email es obligatorio").not().isEmpty(),
    check("password", "El argumento password es obligatorio").not().isEmpty(),
    validarCampos,
], login);

router.post("/enviar/email", [
    validarCampos
], enviarEmail);

router.post("/reenviar/:email", [
    validarCampos,
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail()
], reenviarEmail);

router.post("/google", [
    check("token", "El argumento token de google es obligatorio").not().isEmpty(),
    validarCampos,
], loginGoogle);

router.post("/google2", [
    check("token", "El argumento token de google es obligatorio").not().isEmpty(),
    check('nombre_usuario', 'El argumento nombre_usuario es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
], registroGoogle);

router.put("/activateUser/:token", [
    check("token", "El argumento token de google es obligatorio").not().isEmpty(),
    validarCampos
], activateUser);


module.exports = router;