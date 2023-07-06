const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();

const {
    comprobarPinParental // comprobar el pin parental para salir de la parte del niño
} = require('../controllers/kid');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require("../middleware/validar-jwt");

router.post('/check_pinparental/', [
    validarJWT,
    check('uid', 'El argumento email es obligatorio').not().isEmpty(),
    check('pin_parental', 'El argumento pin_parental es obligatorio').not().isEmpty().trim(),
    validarCampos
], comprobarPinParental);

module.exports = router;