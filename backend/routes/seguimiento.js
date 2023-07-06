const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarCampos } = require('../middleware/validar-campos');
const {
    obtenerRegistrosPesoAltura,
    registrarPesoAltura
} = require('../controllers/seguimiento');
const router = Router();

router.get('/peso-y-altura/:pid', [
    validarJWT,
    check('pid', 'El identificador no es válido').isMongoId(),
], obtenerRegistrosPesoAltura);

router.post('/peso-y-altura/:pid', [
    validarJWT,
    check('pid', 'El identificador no es válido').isMongoId(),
    check('peso', 'El peso no es válido').isNumeric(),
    check('altura', 'La altura no es válida').isNumeric(),
    validarCampos
], registrarPesoAltura);

module.exports = router;