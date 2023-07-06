const { response } = require("express");
const sexosPermitidos = ["NIÑO", "NIÑA"];

const validarSexo = (req, res = response, next) => {
    const { sexo } = req.body;

    if (sexo && !sexosPermitidos.includes(sexo)) {
        return res.status(400).json({
            ok: false,
            msg: "Sexo incorrecto",
        });
    }

    next();
};

module.exports = { validarSexo };