const { Router } = require("express");
const { check } = require("express-validator");
const router = Router();

const {
    obtenerPerfil,
    obtenerPerfiles,
    obtenerPerfilesUsuario,
    crearPerfil,
    actualizarPerfil,
    actualizarAvatar,
    borrarPerfil,
    cambiarEstadoPerfil
} = require('../controllers/perfiles');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require("../middleware/validar-jwt");
const { validarSexo } = require('../middleware/validar-sexo');

router.get('/', [
    validarJWT
], obtenerPerfiles);

// obtener perfiles de un usuario
router.get('/:id', [
    validarJWT,
    check('id', 'El id de usuario debe ser válido').isMongoId(),
    validarCampos,
], obtenerPerfilesUsuario);

// obtener un perfil dado su id
router.get('/perfil/:pid', [
    validarJWT,
    check('pid', 'El id de perfil debe ser válido').isMongoId(),
    validarCampos,
], obtenerPerfil);

router.post('/', [
        validarJWT,
        check('id', 'El id del perfil debe ser obligatorio').optional().isMongoId(),
        check('usuario', 'El argumento usuario no es válido').isMongoId(),
        check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
        check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim(),
        check('fecha_nacimiento', 'El argumento fecha de nacimiento es obligatorio').not().isEmpty().trim(),
        check('sexo', 'El argumento sexo es obligatorio').not().isEmpty(),
        check('peso_actual', 'El argumento peso_actual es obligatorio').not().isEmpty(),
        check('peso_actual', 'El argumento peso_actual debe ser un decimal').optional().isFloat(),
        check("altura_actual", "El argumento altura_actual debe ser un email").not().isEmpty(),
        check("altura_actual", "El argumento altura_actual debe ser un decimal").optional().isFloat(),
        check('peso_objetivo', 'El argumento peso_objetivo es obligatorio').not().isEmpty(),
        check('peso_objetivo', 'El argumento peso_objetivo debe ser un decimal').optional().isFloat(),
        check('objetivo', 'El argumento objetivo no es válido').not().isEmpty(),
        check('intolerancias', 'El argumento intolerancias no es válido').optional().isArray(),
        validarCampos,
        validarSexo,
    ],
    crearPerfil
);

router.put('/:id', [
        validarJWT,
        check('id', 'El id del perfil debe ser obligatorio').optional().isMongoId(),
        check('usuario', 'El argumento usuario no es válido').isMongoId(),
        check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim(),
        check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim(),
        check('fecha_nacimiento', 'El argumento fecha de nacimiento es obligatorio').not().isEmpty().trim(),
        check('sexo', 'El argumento sexo es obligatorio').not().isEmpty(),
        check('peso_actual', 'El argumento peso_actual es obligatorio').not().isEmpty(),
        check('peso_actual', 'El argumento peso_actual debe ser un decimal').optional().isFloat(),
        check("altura_actual", "El argumento altura_actual debe ser un email").not().isEmpty(),
        check("altura_actual", "El argumento altura_actual debe ser un decimal").optional().isFloat(),
        check('peso_objetivo', 'El argumento peso_objetivo es obligatorio').not().isEmpty(),
        check('peso_objetivo', 'El argumento peso_objetivo debe ser un decimal').optional().isFloat(),
        check('objetivo', 'El argumento objetivo no es válido').not().isEmpty(),
        check('intolerancias', 'El argumento intolerancias no es válido').optional().isArray(),
        validarCampos,
        validarSexo,
    ],
    actualizarPerfil
);

router.put('/avatar/:id/:a', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('a', 'El argumento a es obligatorio').not().isEmpty(),
    validarCampos,
], actualizarAvatar);

router.put('/cambiar_estado/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], cambiarEstadoPerfil);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], borrarPerfil);

module.exports = router;