const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const {
    obtenerFactura, // devuelve los datos en editar usuario
    crearFactura, // primer pago para ser premium
    actualizarFactura, // editar datos desde editar usuario
    borrarFactura // dejar de ser premmium
} = require('../controllers/facturacion');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

// devuelve la factura del usuario que pasa el id como parametro
router.get('/:id', [
    validarJWT,
    check('id', 'El id no es válido').isMongoId(),
    validarCampos
], obtenerFactura);

// el usuario pasa por parametro su id
router.post('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim(),
    check('fecha_nacimiento', 'El argumento fecha de nacimiento es obligatorio').not().isEmpty().isDate(),
    check('dni', 'El argumento dni es obligatorio').not().isEmpty().trim(),
    check('movil', 'El argumento móvil no es válido').optional().isNumeric(),
    check('direccion', 'El argumento direccion es obligatorio').not().isEmpty().trim(),
    check('codigo_postal', 'El argumento código postal es obligatorio').not().isEmpty().trim(),
    check('poblacion', 'El argumento población es obligatorio').not().isEmpty().trim(),
    check('provincia', 'El argumento provincia es obligatorio').not().isEmpty().trim(),
    check('pais', 'El argumento pais es obligatorio').not().isEmpty().trim(),
    check('id', 'El id no es válido').isMongoId(),
    validarCampos,
], crearFactura);

// se le pasa por parámetro el id de la factura
router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim(),
    check('fecha_nacimiento', 'El argumento fecha de nacimiento es obligatorio').not().isEmpty().isDate(),
    check('dni', 'El argumento dni es obligatorio').not().isEmpty().trim(),
    check('movil', 'El argumento móvil no es válido').optional().isNumeric(),
    check('direccion', 'El argumento dirección es obligatorio').not().isEmpty().trim(),
    check('codigo_postal', 'El argumento código postal es obligatorio').not().isEmpty().isNumeric(),
    check('poblacion', 'El argumento población es obligatorio').not().isEmpty().trim(),
    check('provincia', 'El argumento provincia es obligatorio').not().isEmpty().trim(),
    check('pais', 'El argumento pais es obligatorio').not().isEmpty().trim(),
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], actualizarFactura);

// el id que se pasa por parámetro es de la factura
router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], borrarFactura);

module.exports = router;