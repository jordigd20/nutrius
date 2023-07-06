const { Router } = require('express');
const { check } = require('express-validator');

const router = Router();

const {
    obtenerMenus,
    crearMenu,
    actualizarMenu,
    borrarMenu
} = require('../controllers/menus');


const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

router.get('/', [
    validarJWT,
    check('id', 'El id del menu debe ser válido').optional().isMongoId(),
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    check('texto', 'El texto de búsqueda debe ser un texto').optional().trim(),
    check('objetivo', 'El objetivo debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerMenus);

router.post('/', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('objetivo', 'El argumento objetivo es obligatorio').not().isEmpty().trim(),
    check('menusem.*.*.*.plato', 'El id del plato no es válido').optional().isMongoId(),
    validarCampos,
], crearMenu);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('objetivo', 'El argumento objetivo es obligatorio').not().isEmpty().trim(),
    check('id', 'El identificador no es válido').isMongoId(),
    check('menusem.*.*.*.plato', 'El id del plato no es válido').optional().isMongoId(),
    validarCampos,
], actualizarMenu);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], borrarMenu);

module.exports = router;