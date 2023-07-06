const { response } = require("express");
const Usuario = require("../models/usuarios");
const bcrypt = require('bcryptjs');

const comprobarPinParental = async(req, res = response) => {

    const { uid, pin_parental } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ _id: uid });

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario no existe"
            });
        }

        // Comprobar que la contraseña introducida es la misma que la que esta en la BD
        if (pin_parental != usuarioBD.pin_parental) {
            return res.status(400).json({
                ok: false,
                msg: "El pin parental no es correcto"
            });
        }

        res.json({
            ok: true,
            msg: 'Pin parental correcto',
            check: true
        });

    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error comprobando el pin parental'
        });
    }
}

module.exports = {
    comprobarPinParental
}