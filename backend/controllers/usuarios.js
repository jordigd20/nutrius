const { response } = require("express");
const Usuario = require('../models/usuarios');
const { borrarPerfil2 } = require('../controllers/perfiles');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/generarjwt');

const obtenerUsuarios = async(req, res = response) => {
    const id = req.query.id || "";
    const email = req.query.email || "";
    const desde = Number(req.query.desde) || 0;
    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }

    const texto = req.query.texto;
    let textoBusqueda = "";

    if (texto) {
        textoBusqueda = new RegExp(texto, "i");
    }

    try {
        let usuarios, total;

        if (id) {
            [usuarios, total] = await Promise.all([
                Usuario.findById(id).populate('perfiles'),
                Usuario.countDocuments(),
            ]);

        } else if (email) {
            [usuarios, total] = await Promise.all([
                Usuario.find({ email: email }),
                Usuario.countDocuments(),
            ]);
        } else {

            let query = {};
            if (texto) {
                query = { $or: [{ nombre_usuario: textoBusqueda }, { email: textoBusqueda }] };
            }

            [usuarios, total] = await Promise.all([
                Usuario.find(query).populate('perfiles').skip(desde).limit(registropp)
                .collation({ locale: "es" })
                .sort({ nombre: 1, email: 1 }),
                Usuario.countDocuments(query),
            ]);
        }

        res.json({
            ok: true,
            msg: "obtenerUsuarios",
            usuarios,
            page: {
                desde,
                registropp,
                total,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los usuarios'
        });
    }
}

const crearUsuario = async(req, res = response) => {
    try {
        const { email, password, pin_parental } = req.body;

        const existeEmail = await Usuario.findOne({ email });
        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: "Email ya existente",
            });
        }

        // Encriptado de la contraseña
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);

        // Crear usuario nuevo
        const usuarioNuevo = new Usuario(req.body);
        usuarioNuevo.password = cpassword;
        await usuarioNuevo.save();
        const token = await generarJWT(usuarioNuevo._id, 'ROL_USUARIO');

        res.json({
            ok: true,
            msg: 'crearUsuarios',
            usuario: usuarioNuevo,
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear usuario'
        });
    }
}

const actualizarUsuario = async(req, res = response) => {
    const { password, admin, email, perfiles, ...datos } = req.body;
    const uid = req.params.id;

    try {

        // Comprobar si está intentando cambiar el email, que no coincida con alguno que ya esté en BD
        // Obtenemos si hay un usuaruio en BD con el email que nos llega en post
        const existeEmail = await Usuario.findOne({ email });

        if (existeEmail) {
            // Si existe un usuario con ese email
            // Comprobamos que sea el suyo, el UID ha de ser igual, si no el email est en uso
            if (existeEmail._id != uid) {
                return res.status(400).json({
                    ok: false,
                    msg: "Email ya existente",
                });
            }
        }

        datos.email = email;
        const usuario = await Usuario.findByIdAndUpdate(uid, datos, { new: true });

        res.json({
            ok: true,
            msg: "Usuario actualizado correctamente",
            usuario
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: "Error actualizando usuario",
        });
    }
}

const actualizarPassword = async(req, res = response) => {
    const uid = req.params.id;
    const { password, nuevopassword, nuevopassword2 } = req.body;

    try {
        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        // Se comprueba que el usuario sabe la contraseña vieja y que ha puesto 
        // dos veces la contraseña nueva
        if (nuevopassword !== nuevopassword2) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña repetida no coincide con la nueva contraseña',
            });
        }

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        }
        // tenemos todo OK, ciframos la nueva contraseña y la actualizamos
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(nuevopassword, salt);
        usuarioBD.password = cpassword;

        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Contraseña actualizada'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar contraseña',
        });
    }
}

const restablecerPassword = async(req, res = response) => {
    const email = req.body.email;
    const { password, confirmarPassword } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ email: email });
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }
        if (password !== confirmarPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña repetida no coincide con la nueva contraseña',
            });
        }
        // tenemos todo OK, ciframos la nueva contraseña y la actualizamos
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);
        usuarioBD.password = cpassword;
        if (usuarioBD.estado === "pendienteGoogle") {
            usuarioBD.estado = "Activo";
        }
        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Contraseña actualizada'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al restablecer contraseña',
        });
    }
}

const crearPinParental = async(req, res = response) => {
    const uid = req.params.id;
    const { pin_parental, repetirpinparental } = req.body;

    try {
        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        // dos veces la contraseña nueva
        if (pin_parental !== repetirpinparental) {
            return res.status(400).json({
                ok: false,
                msg: 'El pin parental repetido no coincide con el nuevo pin',
            });
        }

        usuarioBD.pin_parental = pin_parental;

        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Pin parental creado'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al crear el pin parental',
        });
    }
}

const actualizarPinParental = async(req, res = response) => {
    const uid = req.params.id;
    const { pin_parental, nuevopinparental, nuevopinparental2 } = req.body;

    try {
        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        // Se comprueba que el usuario sabe la contraseña vieja y que ha puesto 
        // dos veces la contraseña nueva
        if (nuevopinparental !== nuevopinparental2) {
            return res.status(400).json({
                ok: false,
                msg: 'El pin parental repetido no coincide con el nuevo pin',
            });
        }

        if (pin_parental != usuarioBD.pin_parental) {
            return res.status(400).json({
                ok: false,
                msg: 'Pin parental incorrecto'
            });
        }

        usuarioBD.pin_parental = nuevopinparental;

        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Pin parental actualizado'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al actualizar el pin parental',
        });
    }
}

const borrarPinParental = async(req, res = response) => {
    const uid = req.params.id;

    try {
        const usuarioBD = await Usuario.findById(uid);
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        usuarioBD.pin_parental = null;

        // Almacenar en BD
        await usuarioBD.save();

        res.json({
            ok: true,
            msg: 'Pin parental borrado'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error al borrar el pin parental',
        });
    }
}

const borrarUsuario = async(req, res = response) => {
    const uid = req.params.id;

    try {
        // Se comprueba si el usuario existe
        const existeUsuario = await Usuario.findById(uid);
        if (!existeUsuario) {
            return res.status(400).json({
                ok: true,
                msg: 'El usuario no existe'
            });
        }

        for (let i = 0; i < existeUsuario.perfiles.length; i++) {
            await borrarPerfil2(existeUsuario.perfiles[i]._id);
        }

        const resultado = await Usuario.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: "Usuario borrado correctamente",
            resultado
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            ok: false,
            msg: "Error borrando usuario",
        });
    }
}

const obtenerUsuarioChatbot = (usuarioABuscar) => {
    return new Promise(async(resolve, reject) => {
        try {
            const { uid } = usuarioABuscar || '';

            if (uid) {
                const usuario = await Usuario.findById(uid).populate('perfiles');
                resolve(usuario);
            } else {
                const { email: emailABuscar } = usuarioABuscar;
                const usuario = await Usuario.findOne({ $or: [{ email: new RegExp(emailABuscar, 'i') }] }).populate('perfiles');
                resolve(usuario);
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    actualizarPassword,
    restablecerPassword,
    crearPinParental,
    actualizarPinParental,
    borrarPinParental,
    borrarUsuario,
    obtenerUsuarioChatbot
};