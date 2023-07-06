const { response } = require("express");
const comidasPermitidas = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

const validarComida = (req, res = response, next) => {
    const { comida } = req.body;
    let coincidencia = false;

    for (let i = 0; i < comida.length; i++) {
        coincidencia = false;
        let element = comida[i]
        if (comidasPermitidas.includes(element)) {
            coincidencia = true;
        }
    }

    if (comida && !coincidencia) {
        return res.status(400).json({
            ok: false,
            msg: "Comida incorrecta",
        });
    }

    next();
};

module.exports = { validarComida };