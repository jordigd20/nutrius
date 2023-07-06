const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();
const {
    obtenerIslas, // obtener la isla de la semana
    obtenerBloqueada, // obtener las islas bloqueadas del mes
    calcularSemanas // calcular la cantidad de semanas del mes
} = require('../controllers/islas');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require("../middleware/validar-jwt");

// se le pasa por parámetro el id del perfil
router.get('/:id', [
    validarJWT,
    check('id', 'El argumento id no es válido').not().isEmpty().isMongoId(),
    validarCampos
], obtenerIslas);

router.get('/', [
    validarJWT
], obtenerBloqueada);

router.get('/semanas/:mes', [
    validarJWT,
    check('mes', 'El argumento mes no es válido').not().isEmpty().isNumeric({ min: 0, max: 11 }),
    validarCampos
], calcularSemanas);

module.exports = router;