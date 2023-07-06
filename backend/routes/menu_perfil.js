const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const {
    obtenerMenuPerfil, // devuelve todos los menus de un perfil || devuelve un menu de un perfil
    obtenerComidasNoCompletadasMenuPerfil, // devuelvo las ultimas 3 comdias no completadas
    crearMenuPerfil, // lo creo cuando se le asigna al perfil
    actualizarMenuPerfil, // actualizo gustado y completado
    actualizarPuntos,
    cambiarPlato,
    comidasCompletadas,
    borrarMenuPerfil,
    obtenerComidasHoy
} = require('../controllers/menu_perfil');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

router.get('/', [
    validarJWT,
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerMenuPerfil);

router.get('/comidas/hoy/:pid', [
    validarJWT,
    check('pid', 'El id no es válido').isMongoId(),
    validarCampos
], obtenerComidasHoy);

// le paso el id del perfil
router.get('/noCompletadas/:pid', [
    validarJWT,
    check('pid', 'El id no es válido').isMongoId(),
    validarCampos
], obtenerComidasNoCompletadasMenuPerfil);

router.get('/comidasCompletadas/:id', [
    validarJWT,
    check('id', 'El id del perfil no es válido').isMongoId(),
    validarCampos
], comidasCompletadas);

// le paso el id del menu y del perfil 
router.post('/:mid/:pid', [
    validarJWT,
    check('pid', 'El id de perfil no es válido').isMongoId(),
    validarCampos,
], crearMenuPerfil);

// le paso id del menu del perfil
router.put('/:id', [
    validarJWT,
    check('id', 'El id del menuPerfil no es válido').isMongoId(),
    validarCampos
], actualizarMenuPerfil);

router.put('/puntos/:id', [
    validarJWT,
    check('id', 'El id del menuPerfil no es válido').isMongoId(),
    validarCampos
], actualizarPuntos);

router.put('/cambiar_plato/:idmp', [
    validarJWT,
    check('dia', 'El argumento dia es obligatorio').not().isEmpty().trim(),
    check('comida', 'El argumento comida es obligatorio').not().isEmpty().trim(),
    check('nuevo_plato', 'El argumento nuevo_plato no es válido').isMongoId(),
    check('idmp', 'El identificador no es válido').isMongoId(),
    validarCampos,
], cambiarPlato);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarMenuPerfil);

module.exports = router;