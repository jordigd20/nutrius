const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();

const {
    obtenerPlanPremium,
    crearUsuarioPremium,
    actualizarUsuarioPremium,
    cancelarPremium,
    borrarPremium
} = require('../controllers/premium');

const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { validarPlan } = require('../middleware/validar-plan');

//Le pasamos el id del usuario para obtener su plan Premium
router.get('/:pid', [
    validarJWT,
    check('pid', 'El pid no es válido').isMongoId(),
    validarCampos
], obtenerPlanPremium);

// le paso el id del usuario que se va a hacer Premium
router.post('/:pid', [
    validarJWT,
    check('pid', 'El id del usuario no es válido').isMongoId(),
    check('plan', 'El argumento plan es obligatorio').not().isEmpty().trim(),
    check('metodo_pago', 'El argumento metodo de pago es obligatorio').not().isEmpty().isNumeric(),
    validarCampos,
    validarPlan
], crearUsuarioPremium);

//le paso el id del plan premium
router.put('/:id', [
    validarJWT,
    check('plan', 'El argumento plan es obligatorio').not().isEmpty().trim(),
    check('metodo_pago', 'El argumento metodo de pago es obligatorio').not().isEmpty().isNumeric(),
    check('id', 'El id del plan premium no es válido').isMongoId(),
    validarCampos,
    validarPlan
], actualizarUsuarioPremium);

router.post('/cancelar/:id', [
    validarJWT,
    check('id', 'El id del plan premium no es válido').isMongoId(),
    validarCampos,
], cancelarPremium);

module.exports = router;