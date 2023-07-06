const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const {
    obtenerRecompensas,
    obtenerRecompensasPerfil,
    crearRecompensa,
    actualizarRecompensa,
    borrarRecompensa
} = require('../controllers/recompensas');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

//Se pasa el id de un perfil para devolver sus recompensas
router.get('/', [
    validarJWT,
    check('id', 'El id del perfil debe ser válido').optional().isMongoId(),
    check('desde', 'El desde debe ser un número').optional().isNumeric(),
    validarCampos
], obtenerRecompensas);

// le paso el id del perfil y 'canjeadas' 'no-canjeadas'
router.get('/:pid/:canjeada', [
    validarJWT,
    check('pid', 'El id del perfil no es válido').isMongoId(),
    validarCampos
], obtenerRecompensasPerfil);

// le paso el id del perfil donde la creo
router.post('/:pid', [
    validarJWT,
    check('pid', 'El id del perfil no es válido').isMongoId(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('puntos', 'El argumento puntos es obligatorio').not().isEmpty().isNumeric(),
    validarCampos,
], crearRecompensa);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
    check('puntos', 'El argumento puntos es obligatorio').not().isEmpty().isNumeric(),
    check('canjeada', 'El argumento canjeada no es válido').optional().isBoolean(),
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], actualizarRecompensa);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], borrarRecompensa);

module.exports = router;