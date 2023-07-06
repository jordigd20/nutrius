const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    actualizarPassword,
    restablecerPassword,
    crearPinParental,
    actualizarPinParental,
    borrarPinParental,
    borrarUsuario,
} = require('../controllers/usuarios');

const { validarCampos } = require('../middleware/validar-campos');
const { validarRol } = require('../middleware/validar-rol');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarRolConPremium } = require('../middleware/validar-rol-premium');

router.get('/', [
    validarJWT,
    check('email', 'El argumento email debe ser un email').optional().isEmail(),
], obtenerUsuarios);

router.post('/', [
    check('nombre_usuario', 'El argumento nombre_usuario es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
    validarRol,
], crearUsuario);

router.put('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('nombre_usuario', 'El argumento nombre_usuario es obligatorio').not().isEmpty().trim(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    validarCampos,
    validarRolConPremium,
], actualizarUsuario);

router.put('/np/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('password', 'El argumento password es obligatorio').not().isEmpty().trim(),
    check('nuevopassword', 'El argumento nuevopassword es obligatorio').not().isEmpty().trim(),
    check('nuevopassword2', 'El argumento nuevopassword2 es obligatorio').not().isEmpty().trim(),
    validarCampos,
], actualizarPassword);

router.put('/change/password', [
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El argumento email debe ser un email').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty().trim(),
    check('confirmarPassword', 'El argumento confirmarPassword es obligatorio').not().isEmpty().trim(),
    validarCampos,
], restablecerPassword);

router.put('/crearpin/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('pin_parental', 'El argumento pin_parental es obligatorio').not().isEmpty(),
    check('repetirpinparental', 'El argumento repetirpinparental es obligatorio').not().isEmpty(),
    validarCampos,
], crearPinParental);

router.put('/actpin/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('pin_parental', 'El argumento pin_parental es obligatorio').not().isEmpty(),
    check('nuevopinparental', 'El argumento nuevopinparental es obligatorio').not().isEmpty(),
    check('nuevopinparental2', 'El argumento nuevopinparental2 es obligatorio').not().isEmpty(),
    validarCampos,
], actualizarPinParental);

router.put('/borrpin/:id', [
    check('id', 'El identificador no es válido').isMongoId()
], borrarPinParental);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarUsuario);

module.exports = router;