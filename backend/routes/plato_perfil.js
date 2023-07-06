const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const {
    obtenerPlatosPerfil,
    obtenerPlatosPerfilComidos,
    obtenerPlatosPerfilMasFallados,
    obtenerPlatosPerfilMasGustados,
    obtenerPlatosPerfilMenosGustados,
    actualizarPlatoPerfil, // actualizo gustado y completado
    actualizarInfoPlato,
    borrarPlatoPerfil,
    borrarPlato,
} = require('../controllers/plato_perfil');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');


router.get('/', [
    validarJWT,
    check('id', 'El id no es válido').optional().isMongoId(),
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerPlatosPerfil);

router.get('/comidos', [
    validarJWT,
    check('perfil_id', 'El id no es válido').optional().isMongoId(),
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerPlatosPerfilComidos);

router.get('/masfallados', [
    validarJWT,
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerPlatosPerfilMasFallados);

router.get('/masgustados', [
    validarJWT,
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerPlatosPerfilMasGustados);

router.get('/menosgustados', [
    validarJWT,
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerPlatosPerfilMenosGustados);

// le paso id de plato-perfil, completado y gustado
router.put('/:id', [
    validarJWT,
    check('id', 'El id del plato-perfil no es válido').isMongoId(),
    check('perfil_id', 'El id del perfil no es válido').optional().isMongoId(),
    check('plato_id', 'El id del plato no es válido').optional().isMongoId(),
    check('veces_gustado', 'El argumento veces_gustado debe ser un número').optional().isNumeric(),
    check('veces_no_gustado', 'El argumento veces_no_gustado debe ser un número').optional().isNumeric(),
    check('veces_fallado', 'El argumento veces_fallado debe ser un número').optional().isNumeric(),
    validarCampos
], actualizarPlatoPerfil);

router.put('/infoplato/:pid', [
    validarJWT,
    check('pid', 'El id del info-plato no es válido').isMongoId(),
    check('completado', 'El argumento completado es obligatorio').not().isEmpty().isBoolean(),
    check('gustado', 'El argumento gustado no es válido').optional().isBoolean(),
    validarCampos
], actualizarInfoPlato);

//Se pasa el id del infoplato a eliminar
router.delete('/infoplato/:pid', [
    validarJWT,
    check('pid', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarPlato);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarPlatoPerfil);

module.exports = router;