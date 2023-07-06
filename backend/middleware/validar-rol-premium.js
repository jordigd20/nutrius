const { response } = require("express");
const rolesPermitidos = ["ROL_USUARIO", "ROL_PREMIUM"];

const validarRolConPremium = (req, res = response, next) => {
    const { rol } = req.body;

    if (rol && !rolesPermitidos.includes(rol)) {
        return res.status(400).json({
            ok: false,
            msg: "Rol incorrecto",
        });
    }

    next();
};

module.exports = { validarRolConPremium };
