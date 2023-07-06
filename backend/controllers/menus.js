const { response } = require('express');
const fs = require('fs');
const Menu = require('../models/menus');

const obtenerMenus = async(req, res = response) => {
    const id = req.query.id || "";
    const desde = Number(req.query.desde) || 0;
    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }

    const texto = req.query.texto;
    const objetivo = req.query.objetivo;
    let textoBusqueda = "";
    let fechaBusq = [];

    if (texto) {
        textoBusqueda = new RegExp(texto, "i");
    }

    try {
        let menus, total;

        if (id) {
            [menus, total] = await Promise.all([
                Menu.findById(id),
                Menu.countDocuments(),
            ]);
        } else {

            let query = {};
            if (texto) {
                let data = fs.readFileSync('../frontend/src/assets/json/elementos.json', 'utf8');
                let obj = JSON.parse(data);
                let cont = 0;
                obj[3].elementos.forEach(el => {
                    if ((el.nombre.toLowerCase()).includes(texto.toLowerCase())) {
                        fechaBusq[cont] = el.id;
                        cont++;
                    }
                });

                if (objetivo) {
                    query = { objetivo: objetivo, $or: [{ nombre: textoBusqueda }, { fecharec: { $in: fechaBusq } }] };
                } else {
                    query = { $or: [{ nombre: textoBusqueda }, { fecharec: { $in: fechaBusq } }] };
                }

            } else {
                if (objetivo) {
                    query = { objetivo: objetivo };
                }
            }

            [menus, total] = await Promise.all([
                Menu.find(query).skip(desde).limit(registropp),
                Menu.countDocuments(query),
            ]);
        }

        res.json({
            ok: true,
            msg: "obtenerMenus",
            menus,
            page: {
                desde,
                registropp,
                total,
            },
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los menus'
        });
    }
}

const crearMenu = async(req, res = response) => {
    const { nombre } = req.body;

    try {
        const existeMenu = await Menu.findOne({ nombre });

        if (existeMenu) {
            return res.status(400).json({
                ok: false,
                msg: 'Existe un menu con el mismo nombre'
            });
        }

        const menu = new Menu(req.body);

        // Almacenar en BD
        await menu.save();

        res.json({
            ok: true,
            msg: 'Menu creado',
            menu,
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al crear menu'
        });
    }
}

const actualizarMenu = async(req, res = response) => {
    const { nombre } = req.body;
    const uid = req.params.id;

    try {

        const existeMenu = await Menu.findById(uid);

        if (!existeMenu) {
            return res.status(500).json({
                ok: false,
                msg: 'El menu no existe'
            });
        }

        const existeMenun = await Menu.findOne({ nombre });

        if (existeMenun && (existeMenun._id != uid)) {
            return res.status(500).json({
                ok: false,
                msg: 'No se puede cambiar el nombre porque ya existe un menu con el mismo nombre'
            });
        }

        const menu = await Menu.findByIdAndUpdate(uid, req.body, { new: true });

        res.json({
            ok: true,
            msg: 'Menu actualizado',
            menu
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando menu'
        });
    }
}

const borrarMenu = async(req, res = response) => {
    const uid = req.params.id;

    try {

        const existeMenu = await Menu.findById(uid);

        if (!existeMenu) {
            return res.status(500).json({
                ok: true,
                msg: 'El menu no existe'
            });
        }

        const resultado = await Menu.findByIdAndRemove(uid);

        res.json({
            ok: true,
            msg: 'Menu eliminado',
            resultado: resultado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando menu'
        });

    }
}

module.exports = {
    obtenerMenus,
    crearMenu,
    actualizarMenu,
    borrarMenu
};