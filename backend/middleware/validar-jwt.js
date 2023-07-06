const { response } = require("express");
const jwt = require("jsonwebtoken");

const validarJWT = (req, res = response, next) => {
    const token = req.header("x-token") || req.query.token;

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: "Falta token de autorizacion",
        });
    }

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);
        req.uid = uid;
        req.rol = rol;

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: "Token no valido",
        });
    }
};

module.exports = { validarJWT };
