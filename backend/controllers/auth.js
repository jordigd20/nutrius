const { response } = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuarios");
const { generarJWT } = require('../helpers/generarjwt');
const { googleVerify } = require('../helpers/google-verify');
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
require('dotenv').config();

const token = async(req, res = response) => {
    const token = req.headers["x-token"];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const usuarioBD = await Usuario.findById(uid);

        // Comprobar que el usuario existe en la BD
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Token no valido",
                token: "",
            });
        }

        const nrol = usuarioBD.rol;
        const nuevoToken = await generarJWT(uid, rol);

        res.json({
            ok: true,
            msg: "Token",
            uid: uid,
            nombre: usuarioBD.nombre,
            apellidos: usuarioBD.apellidos,
            email: usuarioBD.email,
            rol: nrol,
            activo: usuarioBD.activo,
            token: nuevoToken,
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: "Token no válido",
            token: "",
        });
    }
}

const login = async(req, res = response) => {
    const { email, password } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ email });

        // Comprobar que el usuario existe en la BD
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario o contraseña incorrectos",
                token: "",
            });
        }

        // Comprobar que la contraseña introducida es la misma que la que esta en la BD
        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario o contraseña incorrectos",
                token: "",
            });
        }

        if (usuarioBD.estado === "Pendiente" || usuarioBD.estado === "pendienteGoogle") {
            return res.status(400).json({
                ok: false,
                msg: "Usuario pendiente de verificacion",
                estado: usuarioBD.estado,
                token: "",
            });
        }

        const { _id, rol } = usuarioBD;
        // Devolvera el token, si no devolvera el reject de la promesa y saltara el catch del error
        const token = await generarJWT(_id, rol);

        res.json({
            ok: true,
            msg: "login",
            _id,
            rol,
            token,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Error en el login",
            token: "",
        });
    }
}

const loginGoogle = async(req, res = response) => {
    const tokenGoogle = req.body.token;

    try {
        const { email, ...payload } = await googleVerify(tokenGoogle);

        const usuarioBD = await Usuario.findOne({ email });

        // Comprobar que el usuario existe en la BD
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Usuario incorrecto Identificación con Google",
                token: "",
            });
        }
        const { _id, rol } = usuarioBD;
        const token = await generarJWT(_id, rol);

        res.json({
            ok: true,
            msg: 'login google',
            uid: _id,
            rol,
            token
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: "Error en el login Google",
            token: '',
        });
    }
}

const registroGoogle = async(req, res = response) => {
    const tokenGoogle = req.body.token;
    try {
        const { email, ...payload } = await googleVerify(tokenGoogle);
        const usuarioBD = await Usuario.findOne({ email });

        // Comprobar que el usuario existe en la BD
        if (usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un usuario con ese email en la BBDD",
                token: "",
            });
        }

        const usuarioNuevo = new Usuario(req.body);
        const token = await generarJWT(usuarioNuevo._id, 'ROL_USUARIO');
        usuarioNuevo.token = token;
        usuarioNuevo.estado = "pendienteGoogle";
        await usuarioNuevo.save();
        res.json({
            ok: true,
            msg: 'registro google',
            token,
            usuario: usuarioNuevo
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            msg: "Error en el registro con Google",
            token: '',
        });
    }
}

const reenviarEmail = async(req, res = response) => {
    const emailUsuario = req.params.email;
    try {
        const usuario = await Usuario.findOne({ email: emailUsuario });
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "No existe un usuario con ese email"
            });
        }

        const token = await generarJWT(usuario._id, 'ROL_USUARIO');
        const nodemailer = require('nodemailer');
        let smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL, //'areka.abp@gmail.com',
                pass: process.env.EMAILPASS //'dzocptimarhqajdw'
            }
        };
        let transporter = nodemailer.createTransport(smtpConfig);
        transporter.verify(function(error, success) {
            if (error) {
                console.error(error);
            } else {

            }
        });
        let enlace = 'http://localhost:4200';
        if (process.env.NODE_ENV === 'produccion') {
            enlace = 'https://nutrius.ovh';
        }
        let mailOptions = {
            from: usuario.nombre_usuario + '", Bienvenid@ a NutriUs" <areka.abp@gmail.com>',
            to: usuario.email,
            subject: 'Confirmación registro',
            html: `
                <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Arial';">
                    <div style="background-color: #00b593; border-radius: 10px; color: white; padding: 3em;">
                        <img src="https://nutrius.ovh/assets/img/brand/logo_letras_circulo_blanco.png" alt="logoNutriUs" width="250">
                        <h1>¡Hola ${usuario.nombre_usuario}!</h1>
                        <h2>Nos alegra que te hayas unido a NutriUs.</h2>
                        <p>Por favor, pulsa en el siguiente botón para confirmar tu cuenta:</p>
                        <p><strong>Correo:</strong> ${usuario.email}</p>
                        <a href="${enlace}/verification/${token}" style="background-color: #005e4c; border-radius: 10px; color: white; padding: 6.8px 20px; text-decoration: none;"> CONFIRMAR CORREO</a>
                    </div>
                </div>`
        };

        await transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error(error);
                return res.status(400).json({
                    ok: false,
                    msg: "Error enviando email :("
                });
            } else {
                res.json({
                    ok: true,
                    msg: 'Email enviado',
                    info
                });
            }
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({
            ok: false,
            msg: "Error enviando email"
        });
    }
}

const enviarEmail = async(req, res = response) => {
    const emailUsuario = req.body.email;
    const nombreUsu = req.body.usuario || "";
    const token = req.body.token || "";
    try {
        const nodemailer = require('nodemailer');
        let smtpConfig = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL, //'areka.abp@gmail.com',
                pass: process.env.EMAILPASS //'dzocptimarhqajdw'
            }
        };
        let transporter = nodemailer.createTransport(smtpConfig);
        transporter.verify(function(error, success) {
            if (error) {
                console.error(error);
            } else {

            }
        });
        let mailOptions;

        let enlace = 'http://localhost:4200';
        if (process.env.NODE_ENV === 'produccion')
            enlace = 'https://nutrius.ovh';

        if (nombreUsu && token) {
            mailOptions = {
                from: nombreUsu + '", Bienvenid@ a Nutrius" <areka.abp@gmail.com>',
                to: emailUsuario,
                subject: 'Confirmación registro',
                html: `
                    <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Arial';">
                        <div style="background-color: #00b593; border-radius: 10px; color: white; padding: 3em;">
                            <img src="https://nutrius.ovh/assets/img/brand/logo_letras_circulo_blanco.png" alt="logoNutriUs" width="250">
                            <h1>¡Hola ${nombreUsu}!</h1>
                            <h2>Nos alegra que te hayas unido a NutriUs.</h2>
                            <p>Por favor, pulsa en el siguiente botón para confirmar tu cuenta:</p>
                            <p><strong>Correo:</strong> ${emailUsuario}</p>
                            <a href="${enlace}/verification/${token}" style="background-color: #005e4c; border-radius: 10px; color: white; padding: 6.8px 20px; text-decoration: none;"> CONFIRMAR CORREO</a>
                        </div>
                    </div>`
            };
        } else {
            const existeUsuario = await Usuario.findOne({ email: emailUsuario });
            if (existeUsuario) {
                const nombre = existeUsuario.nombre_usuario;
                mailOptions = {
                    from: '"Recuperar Contraseña - Nutrius" <areka.abp@gmail.com>',
                    to: emailUsuario,
                    subject: 'Recuperar Contraseña',
                    html: `
                        <div style="display: flex; flex-direction: column; align-items: center; font-family: 'Arial';">
                            <div style="background-color: #00b593; border-radius: 10px; color: white; padding: 3em;">
                                <img src="https://nutrius.ovh/assets/img/brand/logo_letras_circulo_blanco.png" alt="logoNutriUs" width="250">
                                <h1 style="color: white">¡Hola ${nombre}!</h1>
                                <h2 style="color: white">¿Has olvidado tu contraseña? ¿Quieres crear una nueva?</h2>
                                <p style="color: white">Por favor, pulsa en el siguiente botón para restablecer tu contraseña:</p>
                                <a href="${enlace}/recovery/${emailUsuario}" style="background-color: #005e4c; border-radius: 10px; color: white; padding: 6.8px 20px; text-decoration: none;"> RESTABLECER CONTRASEÑA</a>
                            </div>
                        </div>`
                };
            }

        }

        await transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.error(error);
                return res.status(400).json({
                    ok: false,
                    msg: "Error enviando email"
                });
            } else {
                res.json({
                    ok: true,
                    msg: 'Email enviado',
                    info
                });
            }
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            ok: false,
            msg: "Error enviando email"
        });
    }
}

const activateUser = async(req, res = response) => {
    const token = req.params.token;
    try {
        var decoded = jwt_decode(token);
        const usuario = await Usuario.findById(decoded.uid);
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: "El usuario no existe"
            });
        }
        const usu = await Usuario.findByIdAndUpdate(decoded.uid, { estado: "Activo" }, { new: true });
        res.json({
            ok: true,
            msg: 'Usuario activado',
            usu
        });

    } catch (e) {
        console.error(e);
        return res.status(400).json({
            ok: false,
            msg: "Error activando Usuario"
        });
    }
}

const autenticarUsuarioChatbot = (uid, password) => {
    return new Promise(async(resolve, reject) => {
        try {
            const usuarioBD = await Usuario.findById(uid);
            // Comprobar que la contraseña introducida es la misma que la que esta en la BD
            const validPassword = bcrypt.compareSync(password, usuarioBD.password);

            if (!validPassword) {
                throw new Error('Credenciales incorrectas');
            }

            resolve(validPassword);
        } catch (err) {
            reject(err);
        }
    });
}

const verificarToken = (token) => {
    return new Promise(async(resolve, reject) => {
        try {
            const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);
            const usuarioBD = await Usuario.findById(uid);

            // Comprobar que el usuario existe en la BD
            if (!usuarioBD) {
                throw new Error('Usuario no identificado')
            }
            resolve(usuarioBD);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    token,
    login,
    loginGoogle,
    registroGoogle,
    enviarEmail,
    reenviarEmail,
    activateUser,
    autenticarUsuarioChatbot,
    verificarToken
};