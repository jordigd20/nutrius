const { Router } = require('express');
const { validarJWT } = require('../middleware/validar-jwt');
const {
    chatbot,
    respuestaDialogflow
} = require('../controllers/chatbot');
const router = Router();

router.post('/', chatbot);

router.post("/respuesta", [
    validarJWT
], respuestaDialogflow);

module.exports = router;