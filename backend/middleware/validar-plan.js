const { response } = require("express");
const planesDisponibles = ["1 mes", "3 meses", "6 meses", "1 año"];

const validarPlan = (req, res = response, next) => {
    const { plan } = req.body;

    if (plan && !planesDisponibles.includes(plan)) {
        return res.status(400).json({
            ok: false,
            msg: "Plan incorrecto",
        });
    }

    next();
};

module.exports = { validarPlan };