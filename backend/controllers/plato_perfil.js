const { response } = require("express");
const PlatoPerfil = require('../models/plato_perfil');
const Plato = require('../models/platos');
const Perfil = require('../models/perfiles');

const obtenerPlatosPerfil = async(req, res = response) => {
    const id = req.query.id || "";
    const desde = Number(req.query.desde) || 0;
    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }

    const perfil = req.query.perfil_id || '';
    const texto = req.query.texto;
    let textoBusqueda = "";

    if (texto) {
        textoBusqueda = new RegExp(texto, "i");
    }

    try {
        let platosPerfil, total, orden = {};
        if (id) {
            [platosPerfil, total] = await Promise.all([
                PlatoPerfil.findById(id).populate('plato_id'),
                PlatoPerfil.countDocuments(),
            ]);
        } else {

            let query = {};
            let populate = { path: 'plato_id' };
            if (perfil !== '') {
                const existePerfil = await Perfil.findById(perfil);
                if (existePerfil) {
                    query = { 'perfil_id': perfil };
                    orden = { 'info_plato.fecha': 1 };
                }
            }

            // Si se busca el nombre de un plato, hay que buscar desde el populate
            if (textoBusqueda !== '') {
                populate.match = {
                    nombre: textoBusqueda
                }
            }

            [platosPerfil, total] = await Promise.all([
                PlatoPerfil.find(query).sort(orden).skip(desde).limit(registropp).populate(populate),
                PlatoPerfil.countDocuments(query),
            ]);
        }

        // Al buscar desde el populate, los que no encuentra los pone a null
        // entonces hay que quitarlos del array
        if (textoBusqueda !== '') {
            platosPerfil = platosPerfil.filter(plato => plato.plato_id != null);
        }

        res.json({
            ok: true,
            msg: "obtenerPlatosPerfil",
            platosPerfil,
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
            msg: 'Error al obtener los platos del perfil'
        });
    }
}

const obtenerPlatosPerfilComidos = async(req, res = response) => {
    const desde = Number(req.query.desde) || 0;
    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }

    const perfil = req.query.perfil_id || '';
    const texto = req.query.texto;
    let textoBusqueda = "";

    if (texto) {
        textoBusqueda = new RegExp(texto, "i");
    }

    try {
        let platosPerfil, totalPlatos, orden, query = {};
        if (perfil !== '') {
            const existePerfil = await Perfil.findById(perfil);
            if (existePerfil) {
                query = { 'perfil_id': perfil };
            }
        }
        let populate = { path: 'plato_id' };
        // Si se busca el nombre de un plato, hay que buscar desde el populate
        if (textoBusqueda !== '') {
            populate.match = {
                nombre: textoBusqueda
            }
        }

        let completados = [];
        [platosPerfil, totalPlatos] = await Promise.all([
            PlatoPerfil.find(query).populate(populate),
            PlatoPerfil.countDocuments(query),
        ]);
        // Al buscar desde el populate, los que no encuentra los pone a null
        // entonces hay que quitarlos del array
        if (textoBusqueda !== '') {
            platosPerfil = platosPerfil.filter(plato => plato.plato_id != null);
        }

        for (let i = 0; i < platosPerfil.length; i++) {
            const nuevo = new Object();
            nuevo.id = platosPerfil[i]._id;
            nuevo.totalMarcado = 0;
            for (let j = 0; j < platosPerfil[i].info_plato.length; j++) {
                if (platosPerfil[i].info_plato[j].marcado) {
                    nuevo.totalMarcado += 1;
                }
            }
            if (nuevo.totalMarcado > 0) {
                completados.push(platosPerfil[i]);
            }
        }

        //Ordenados por veces comido
        completados.sort(function(a, b) {
            if (a.totalMarcado > b.totalMarcado) {
                return -1;
            }
            if (a.totalMarcado < b.totalMarcado) {
                return 1;
            }
            return 0;
        });
        let resultados = [];
        let total = completados.length;
        let hasta = desde + registropp;
        if (hasta >= completados.length) {
            hasta = completados.length;
        }
        for (let i = desde; i < hasta; i++) {
            const plato = await PlatoPerfil.findById(completados[i].id).populate(populate);
            resultados.push(plato);
        }

        res.json({
            ok: true,
            msg: "obtenerPlatosPerfilComidos",
            resultados,
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
            msg: 'Error al obtener los platos comidos del perfil'
        });
    }
}

const obtenerPlatosPerfilMasFallados = async(req, res = response) => {
    const perfil = req.query.perfil_id || '';
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    try {
        let platosPerfil, total, query = {};
        if (perfil !== '') {
            const existePerfil = await Perfil.findById(perfil);
            if (existePerfil) {
                query = { 'perfil_id': perfil };
            }
        }

        let fallados = [];
        [platosPerfil, total] = await Promise.all([
            PlatoPerfil.find(query).populate('plato_id'),
            PlatoPerfil.countDocuments(query),
        ]);

        for (let i = 0; i < platosPerfil.length; i++) {
            const nuevo = new Object();
            nuevo.id = platosPerfil[i]._id;
            nuevo.totalMarcado = 0;
            nuevo.veces_fallado = platosPerfil[i].veces_fallado;
            for (let j = 0; j < platosPerfil[i].info_plato.length; j++) {
                if (platosPerfil[i].info_plato[j].marcado) {
                    nuevo.totalMarcado += 1;
                }
            }
            if (platosPerfil[i].veces_fallado > 0) {
                nuevo.totalFallado = platosPerfil[i].veces_fallado / nuevo.totalMarcado;
                if (!Number.isInteger(nuevo.totalFallado)) {
                    nuevo.totalFallado = Number.parseFloat(nuevo.totalFallado).toFixed(2);
                }
                nuevo.totalFallado = nuevo.totalFallado * 100;
            } else {
                nuevo.totalFallado = 0;
            }

            fallados.push(nuevo);
        }
        fallados.sort(function(a, b) {
            if (a.totalFallado > b.totalFallado) {
                return -1;
            }
            if (a.totalFallado < b.totalFallado) {
                return 1;
            }
            return 0;
        });
        let resultados = [];
        for (let i = 0; i < 10; i++) {
            const plato = await PlatoPerfil.findById(fallados[i].id).populate('plato_id');
            resultados.push(plato);
        }

        res.json({
            ok: true,
            msg: "obtenerPlatosPerfilMasFallados",
            resultados,
            fallados,
            page: {
                desde,
                registropp,
                total,
            },
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los platosperfil mas fallados'
        });
    }
}

const obtenerPlatosPerfilMasGustados = async(req, res = response) => {
    const perfil = req.query.perfil_id || '';
    const desde = Number(req.query.desde) || 0;
    let registropp = Number(process.env.DOCSPERPAGE);

    if (!req.query.registropp == '' && Number(req.query.registropp) != registropp) {
        registropp = Number(req.query.registropp);
    }

    try {
        let platosPerfil, total, query = {};
        if (perfil !== '') {
            const existePerfil = await Perfil.findById(perfil);
            if (existePerfil) {
                query = { 'perfil_id': perfil };
            }
        }
        let gustados = [];
        [platosPerfil, total] = await Promise.all([
            PlatoPerfil.find(query).populate('plato_id'),
            PlatoPerfil.countDocuments(query),
        ]);

        for (let i = 0; i < platosPerfil.length; i++) {
            const nuevo = new Object();
            nuevo.id = platosPerfil[i]._id;
            nuevo.totalComido = 0;
            nuevo.veces_gustado = platosPerfil[i].veces_gustado;
            for (let j = 0; j < platosPerfil[i].info_plato.length; j++) {
                if (platosPerfil[i].info_plato[j].completado) {
                    nuevo.totalComido += 1;
                }
            }
            if (platosPerfil[i].veces_gustado > 0) {
                nuevo.totalGustado = platosPerfil[i].veces_gustado / nuevo.totalComido;
                if (!Number.isInteger(nuevo.totalGustado)) {
                    nuevo.totalGustado = Number.parseFloat(nuevo.totalGustado).toFixed(2);
                }
                nuevo.totalGustado = nuevo.totalGustado * 100;
            } else {
                nuevo.totalGustado = 0;
            }

            gustados.push(nuevo);
        }
        gustados.sort(function(a, b) {
            if (a.totalGustado > b.totalGustado) {
                return -1;
            }
            if (a.totalGustado < b.totalGustado) {
                return 1;
            }
            return 0;
        });
        let resultados = [];
        for (let i = 0; i < 10; i++) {
            const plato = await PlatoPerfil.findById(gustados[i].id).populate('plato_id');
            resultados.push(plato);
        }

        res.json({
            ok: true,
            msg: "obtenerPlatosPerfilMasGustados",
            resultados,
            gustados,
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
            msg: 'Error al obtener los platosperfil mas gustados'
        });
    }
}

const obtenerPlatosPerfilMenosGustados = async(req, res = response) => {
    const perfil = req.query.perfil_id || '';
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    try {
        let platosPerfil, total, query = {};
        if (perfil !== '') {
            const existePerfil = await Perfil.findById(perfil);
            if (existePerfil) {
                query = { 'perfil_id': perfil };
            }
        }

        let no_gustados = [];
        [platosPerfil, total] = await Promise.all([
            PlatoPerfil.find(query).populate('plato_id'),
            PlatoPerfil.countDocuments(query),
        ]);

        for (let i = 0; i < platosPerfil.length; i++) {
            const nuevo = new Object();
            nuevo.id = platosPerfil[i]._id;
            nuevo.totalComido = 0;
            nuevo.veces_nogustado = platosPerfil[i].veces_no_gustado;
            for (let j = 0; j < platosPerfil[i].info_plato.length; j++) {
                if (platosPerfil[i].info_plato[j].completado) {
                    nuevo.totalComido += 1;
                }
            }
            if (platosPerfil[i].veces_no_gustado > 0) {
                nuevo.totalNoGustado = platosPerfil[i].veces_no_gustado / nuevo.totalComido;
                if (!Number.isInteger(nuevo.totalNoGustado)) {
                    nuevo.totalNoGustado = Number.parseFloat(nuevo.totalNoGustado).toFixed(2);
                }
                nuevo.totalGustado = nuevo.totalGustado * 100;
            } else {
                nuevo.totalNoGustado = 0;
            }
            no_gustados.push(nuevo);
        }
        no_gustados.sort(function(a, b) {
            if (a.totalNoGustado > b.totalNoGustado) {
                return -1;
            }
            if (a.totalNoGustado < b.totalNoGustado) {
                return 1;
            }
            return 0;
        });
        let resultados = [];
        for (let i = 0; i < 10; i++) {
            const plato = await PlatoPerfil.findById(no_gustados[i].id).populate('plato_id');
            resultados.push(plato);
        }

        res.json({
            ok: true,
            msg: "obtenerPlatosPerfilMenosGustados",
            resultados,
            no_gustados,
            page: {
                desde,
                registropp,
                total,
            },
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener los platosperfil menos gustados'
        });
    }
}

const devolverId = (plato) => {
    return plato._id;
}

const crearPlatoPerfil = (platoid, perfilid, dia, comida, fecha) => {
    const plato_id = platoid;
    const perfil_id = perfilid;
    return new Promise(async(resolve, reject) => {
        try {
            const existePlato = await Plato.findById(plato_id);
            const existePerfil = await Perfil.findById(perfil_id);
            if (!existePerfil) {
                reject('No existe el perfil');
            }

            if (!existePlato) {
                reject('El plato no existe, no se puede crear plato-perfil');
            }

            //Comprobamos si ya existe el platoPerfil
            const existepPerfil = await PlatoPerfil.findOne({ "plato_id": plato_id, "perfil_id": perfil_id });

            //Si no existe el platoPerfil, lo creamos
            //Devolvemos el id del platoPerfil
            if (!existepPerfil) {
                const platoPerfil = new PlatoPerfil({ perfil_id, plato_id });
                await platoPerfil.save();
                const info = await addComida(platoPerfil._id, dia, comida, fecha);
                resolve(platoPerfil);
            } else {
                const respuesta = existepPerfil._id;
                await addComida(existepPerfil._id, dia, undefined, fecha);
                const info = await addComida(existepPerfil._id, dia, comida, fecha);
                resolve(existepPerfil);
            }
        } catch (error) {
            reject(error);
        }
    });

}

const restarDias = (fecha) => {
    let res = new Date(fecha);
    res.setDate(res.getDate() - 1);
    return res;
}

const sumarDias = (fecha) => {
    let res = new Date(fecha);
    res.setDate(res.getDate() + 1);
    return res;
}

    //Añade un info_plato a Plato_perfil, que sería una nueva vez que un perfil se come un plato en concreto
    //Se le pasa el id de plato_perfil
const addComida = async(id, day, comida, f) => {
    try {
        const date = day;
        let dia = -1;
        switch (date) {
            case "lunes":
                dia = 1;
                break;
            case "martes":
                dia = 2;
                break;
            case "miercoles":
                dia = 3;
                break;
            case "jueves":
                dia = 4;
                break;
            case "viernes":
                dia = 5;
                break;
            case "sabado":
                dia = 6;
                break;
            case "domingo":
                dia = 0;
                break;
        }
        let fecha = new Date();
        fecha.setFullYear(f.getFullYear(), f.getMonth(), f.getDate());
        fecha.setTime(f.getTime());

        let esLunes = false;
        let coincide = false;
        while (!esLunes) {
            if (fecha.getDay() == 1) {
                esLunes = true;
            } else {
                fecha = restarDias(fecha);
            }
        }
        while (!coincide) {
            if (fecha.getDay() == dia) {
                coincide = true;
            } else {
                fecha = sumarDias(fecha);
            }
        }
        const existepPerfil = await PlatoPerfil.findById(id);
        if (existepPerfil) {
            const nuevo = new Object();
            var nuevo_id;
            nuevo.gustado = false;
            nuevo.completado = false;
            nuevo.fecha = fecha;
            if (comida !== undefined) {
                nuevo.comida = comida;
                existepPerfil.info_plato.push(nuevo);
                existepPerfil.save();
            }
            (existepPerfil.info_plato).forEach(plato => {
                nuevo_id = plato._id;
            });
            return nuevo_id;
        }
    } catch (error) {
        console.error(error);
    }
}

const actualizarPlatoPerfil = async(req, res = response) => {
    const id = req.params.id;

    try {
        const existePlatoPerfil = await PlatoPerfil.findById(id);
        
        if (!existePlatoPerfil) {
            return res.status(500).json({
                ok: false,
                msg: 'El plato perfil no existe'
            });
        }
        
        const platoPerfil = await PlatoPerfil.findByIdAndUpdate(id, req.body, { new: true });

        res.json({
            ok: true,
            msg: 'Plato-perfil actualizado',
            platoPerfil
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando plato-perfil'
        })
    }
}

const actualizarpPerfil = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            const existePlatoPerfil = await PlatoPerfil.findById(id);

            if (!existePlatoPerfil) {
                return res.status(500).json({
                    ok: false,
                    msg: 'El plato perfil no existe'
                });
            } else {
                let gustado = 0;
                let no_gustado = 0;
                let fallado = 0;
                if (existePlatoPerfil.info_plato.length > 0) {
                    for (let i = 0; i < existePlatoPerfil.info_plato.length; i++) {
                        const infoPlato = existePlatoPerfil.info_plato[i];
                        if (!infoPlato.completado) {
                            fallado = fallado + 1;
                        }
                        if (infoPlato.gustado) {
                            gustado = gustado + 1;
                        } else {
                            no_gustado = no_gustado + 1;
                        }
                    }
                }
                req.body.veces_gustado = gustado;
                req.body.veces_no_gustado = no_gustado;
                req.body.veces_fallado = fallado;
            }

            const platoPerfil = await PlatoPerfil.findByIdAndUpdate(id, req.body, { new: true });
            resolve(platoPerfil);

        } catch (error) {
            reject(error);
        }
    });
}


//se le pasa el id del infoplato
const actualizarInfoPlato = async(req, res = response) => {
    const id = req.params.pid;
    try {
        const existePlato = await PlatoPerfil.findOne({ "info_plato._id": id });
        if (!existePlato) {
            return res.status(500).json({
                ok: false,
                msg: 'El info-plato no existe'
            });
        }
        (existePlato.info_plato).forEach(info => {
            if (info._id.equals(id)) {
                info.completado = req.body.completado;
                info.gustado = req.body.gustado;
            }
        });
        existePlato.save();
        res.json({
            ok: true,
            msg: 'Infoplato actualizado',
            existePlato
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error actualizando infoplato'
        });
    }
}

//tiene que eliminar el info_plato de un platoPerfil, pasado el id de ese info_plato
const borrarPlato = (id) => {
    return new Promise(async(resolve, reject) => {
        try {
            const existePlato = await PlatoPerfil.findOne({ "info_plato._id": id });
            if (existePlato) {
                for (let i = 0; i < existePlato.info_plato.length; i++) {
                    if (existePlato.info_plato[i]._id.equals(id)) {
                        (existePlato.info_plato).splice(i, 1);
                    }
                }
                await existePlato.save();
            }
            if (existePlato.info_plato.length === 0) {
                await PlatoPerfil.findByIdAndRemove(existePlato._id);
            }
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

const borrarPlatoPerfil = async(req, res = response) => {
    const id = req.params.id;

    try {
        const existePlatoPerfil = await PlatoPerfil.findById(id);

        if (!existePlatoPerfil) {
            return res.status(500).json({
                ok: false,
                msg: 'El plato-perfil no existe'
            });
        }

        const resultado = await PlatoPerfil.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'Plato-perfil eliminado',
            resultado: resultado
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error borrando plato-perfil'
        });
    }
}

module.exports = {
    obtenerPlatosPerfil,
    obtenerPlatosPerfilComidos,
    obtenerPlatosPerfilMasFallados,
    obtenerPlatosPerfilMasGustados,
    obtenerPlatosPerfilMenosGustados,
    addComida,
    crearPlatoPerfil,
    actualizarPlatoPerfil,
    actualizarpPerfil,
    actualizarInfoPlato,
    borrarPlato,
    borrarPlatoPerfil
};