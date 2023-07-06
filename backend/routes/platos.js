const { Router } = require('express');
const { check } = require('express-validator');

const router = Router();

const {
    obtenerPlatos,
    crearPlato,
    actualizarPlato,
    borrarPlato,
    enviarArchivo,
    subirArchivo,
    borrarFoto
} = require('../controllers/platos');


const { validarCampos } = require('../middleware/validar-campos');
const { validarComida } = require('../middleware/validar-comida');
const { validarJWT } = require('../middleware/validar-jwt');

router.get('/', [validarJWT], obtenerPlatos);

router.get('/imagen/:nombrearchivo', [
    validarJWT,
    check('nombrearchivo', 'El nombre del archivo debe ser válido').trim(),
    validarCampos,
], enviarArchivo);

router.post('/', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('comida', 'El argumento comida es obligatorio').isArray(),
    check('intolerancias', 'El argumento intolerancias es obligatorio').isArray(),
    validarCampos,
    validarComida,
], crearPlato);

router.put('/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').isMongoId(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('comida', 'El argumento comida es obligatorio').isArray(),
    check('intolerancias', 'El argumento intolerancias es obligatorio').isArray(),
    validarCampos,
    validarComida,
], actualizarPlato);

router.put('/imagen/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').isMongoId(),
    validarCampos,
], subirArchivo);

router.put('/imgdel/:id', [
    validarJWT,
    check('id', 'El id debe ser válido').isMongoId(),
    validarCampos,
], borrarFoto);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], borrarPlato);

module.exports = router;