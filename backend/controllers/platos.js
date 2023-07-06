const { response } = require('express');
const { v4: uuidv4 } = require('uuid');
const { actualizarBD } = require('../helpers/actualizarbd');
const fs = require('fs');
require('dotenv').config();

const Plato = require('../models/platos');
const { quitarTildes } = require('../helpers/quitarTildes');

const obtenerPlatos = async(req, res = response) => {
    const id = req.query.id || "";
    const uid = req.query.uid || "";
    const admin = req.query.admin || "";
    const desde = Number(req.query.desde) || 0;
    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }
    const texto = req.query.texto;
    const comidas = req.query.comidas;
    const intolerancias = req.query.intolerancias;
    let textoBusqueda = "";
    let comidasBusq = [];
    let intoleranciasBusq = [];

    if (texto) {
        textoBusqueda = quitarTildes(texto.toString());
    }
    if (comidas) {
        let comid = comidas.split(",");
        comidasBusq = comid.filter(e => e);
    }
    if (intolerancias) {
        let intol = intolerancias.split(",");
        intoleranciasBusq = intol.filter(e => e);
    }

    try {
        let platos, total;

        if (id) {
            [platos, total] = await Promise.all([
                Plato.findById(id),
                Plato.countDocuments(),
            ]);

        } else {

            let query = {};
            let orDone = false;

            if (uid && admin === 'admin') {

                if (texto && !orDone) {
                    query.$or = [{ usuario_id: uid }, { usuario_id: { $type: 10 } }];
                    query.$and = [{ nombre: { $regex: '.*' + textoBusqueda + '.*', $options: 'i' } }];
                    orDone = true;
                } else {
                    query.$or = [{ usuario_id: uid }, { usuario_id: { $type: 10 } }];
                    orDone = true;
                }
            } else if (uid) { query.usuario_id = uid; } else if (admin === 'admin') { query.usuario_id = { $type: 10 }; }

            if (texto && !orDone) { query.$or = [{ nombre: { $regex: '.*' + textoBusqueda + '.*', $options: 'i' } }]; }

            if (comidas) { query.comida = { $all: comidasBusq }; }

            if (intolerancias) { query.intolerancias = { $nin: intoleranciasBusq }; }

            [platos, total] = await Promise.all([
                Plato.find(query).skip(desde).limit(registropp),
                Plato.countDocuments(query)
            ]);
        }

        res.json({
            ok: true,
            msg: "obtenerPlatos",
            platos,
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
            msg: 'Error al obtener los platos'
        });
    }
}

const enviarArchivo = async(req, res = response) => {
    try {
        const nombreArchivo = req.params.nombrearchivo;
        let path = '';
        if (process.env.NODE_ENV === 'produccion') {
            path = `../../www/html/assets/img/platos/${nombreArchivo}`;
        } else {
            path = `../frontend/src/assets/img/platos/${nombreArchivo}`;
        }

        if (!fs.existsSync(path)) {
            return res.status(400).json({
                ok: false,
                msg: 'El archivo no existe'
            });
        } else {
            let path2 = '';
            if (process.env.NODE_ENV === 'produccion') {
                path2 = `../../www/html/assets/img/platos`;
            } else {
                path2 = `../frontend/src/assets/img/platos`;
            }
            res.sendFile(nombreArchivo, { root: path2 });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error abriendo archivo'
        });
    }
}

const crearPlato = async(req, res = response) => {
    const { nombre } = req.body;

    try {
        const existePlato = await Plato.findOne({ nombre });

        if (existePlato) {
            return res.status(400).json({
                ok: false,
                msg: 'Existe un plato con el mismo nombre'
            });
        }

        const plato = new Plato(req.body);

        // Almacenar en BD
        await plato.save();

        res.json({
            ok: true,
            msg: 'Plato creado',
            plato,
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al crear plato'
        });
    }
}

const subirArchivo = async(req, res = response) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se ha subido el archivo'
            });
        }

        if (req.files.archivo.truncated) {
            return res.status(400).json({
                ok: false,
                msg: `El archivo es demasiado grande, permitido hasta ${process.env.MAXSIZEUPLOAD}`,
            });
        }
        const id = req.params.id;
        const archivo = req.files.archivo;
        const partido = archivo.name.split('.');
        const extension = partido[partido.length - 1];
        const formatosPermitidos = ['jpeg', 'jpg', 'png'];
        if (!formatosPermitidos.includes(extension)) {
            return res.status(400).json({
                ok: false,
                msg: `El tipo de archivo ${extension} no está permitido (${formatosPermitidos})`,
            });
        }

        const nombreArchivo = `${uuidv4()}.${extension}`;
        let path = '';
        if (process.env.NODE_ENV === 'produccion') {
            path = `../../www/html/assets/img/platos/${nombreArchivo}`;
        } else {
            path = `../frontend/src/assets/img/platos/${nombreArchivo}`;
        }

        archivo.mv(path, (err) => {
            if (err) {
                console.error(err);
                return res.status(400).json({
                    ok: false,
                    msg: 'No se pudo cargar el archivo'
                });
            }

            actualizarBD(path, nombreArchivo, id)
                .then(valor => {
                    if (!valor) {
                        fs.unlinkSync(path);
                        return res.status(400).json({
                            ok: false,
                            msg: 'No se pudo actualizar BD'
                        });
                    } else {
                        res.json({
                            ok: true,
                            msg: 'Archivo subido correctamente',
                            nombreArchivo
                        });
                    }
                }).catch(error => {
                    console.error(error);
                    fs.unlinkSync(path);
                    return res.status(400).json({
                        ok: false,
                        msg: 'Error al cargar archivo'
                    });
                });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error subiendo archivo'
        });
    }
}

const borrarFoto = async(req, res = response) => {
    const id = req.params.id;
    
    try {
        let path = '';
        if (process.env.NODE_ENV === 'produccion') {
            path = `../../www/html/assets/img/platos/`;
        } else {
            path = `../frontend/src/assets/img/platos/`;
        }
        const nombreArchivo = ``;
        actualizarBD(path, nombreArchivo, id)
            .then(valor => {
                if (!valor) {
                    fs.unlinkSync(path);
                    return res.status(400).json({
                        ok: false,
                        msg: 'No se pudo actualizar BD'
                    });
                } else {
                    res.json({
                        ok: true,
                        msg: 'Archivo borrado correctamente',
                        nombreArchivo
                    });
                }
            }).catch(error => {
                fs.unlinkSync(path);
                return res.status(400).json({
                    ok: false,
                    msg: 'Error al cargar archivo'
                });
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando archivo'
        });
    }
}


const actualizarPlato = async(req, res = response) => {
    const { nombre } = req.body;
    const uid = req.params.id;

    try {
        const existePlato = await Plato.findById(uid);

        if (!existePlato) {
            return res.status(500).json({
                ok: false,
                msg: 'El plato no existe'
            });
        }

        const existePlaton = await Plato.findOne({ nombre });

        if (existePlaton && (existePlaton._id != uid)) {
            return res.status(500).json({
                ok: false,
                msg: 'No se puede cambiar el nombre porque ya existe un plato con el mismo nombre'
            });
        }

        const plato = await Plato.findByIdAndUpdate(uid, req.body, { new: true });

        res.json({
            ok: true,
            msg: 'Plato actualizado',
            plato
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando plato'
        });
    }
}

const borrarPlato = async(req, res = response) => {
    const uid = req.params.id;

    try {
        const existePlato = await Plato.findById(uid);

        if (!existePlato) {
            return res.status(500).json({
                ok: true,
                msg: 'El plato no existe'
            });
        }

        const resultado = await Plato.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Plato eliminado',
            resultado: resultado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando plato'
        });
    }
}

const buscarPlatoChatbot = (plato) => {
    return new Promise(async(resolve, reject) => {
        try {
            const platos = await Plato.find({ $or: [{ nombre: new RegExp(plato, 'i') }] });
            resolve(platos);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    obtenerPlatos,
    crearPlato,
    actualizarPlato,
    borrarPlato,
    enviarArchivo,
    subirArchivo,
    buscarPlatoChatbot,
    borrarFoto
};