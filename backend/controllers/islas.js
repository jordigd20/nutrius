const { response } = require("express");
const Isla = require('../models/islas');
const Perfil = require('../models/perfiles');
const MenuPerfil = require('../models/menu_perfil');

const obtenerIslas = async(req, res = response) => {
    const uid = req.params.id;
    try {
        const existePerfil = await Perfil.findById(uid);
        const existeIsla = await Isla.findById(uid);
        if (!existePerfil && !existeIsla) {
            res.status(500).json({
                ok: false,
                msg: 'Identificador no válido'
            });
        }
        let islas = [];

        if (existePerfil) {

            let listaIslas = await MenuPerfil.find({ perfil_id: uid });
            for (let i = 0; i < listaIslas.length; i++) {
                let isla = await Isla.findById(listaIslas[i].isla.isla);
                if (isla) {
                    islas.push(isla);
                }
            }
        } else if (existeIsla) {
            islas.push(existeIsla);
        }
        res.json({
            ok: true,
            msg: 'Obtener islas',
            islas,
            total: islas.length
        });

    } catch (error) {
        console.error(error);
    }
}

const obtenerBloqueada = async(req, res = response) => {
    try {
        const isla = await Isla.findOne({ nombre: "isla1-base-bloqueado" });
        if (!isla) {
            res.status(500).json({
                ok: false,
                msg: 'No existe la isla bloqueada'
            });
        }
        res.json({
            ok: true,
            msg: 'Obtener isla bloqueada',
            isla
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener la isla bloqueada'
        });
    }
}

const calcularSemanas = async(req, res = response) => {
    const mes = req.params.mes;
    try {
        let month = -1;
        switch (mes) {
            case "0":
                month = 0;
                break;
            case "1":
                month = 1;
                break;
            case "2":
                month = 2;
                break;
            case "3":
                month = 3;
                break;
            case "4":
                month = 4;
                break;
            case "5":
                month = 5;
                break;
            case "6":
                month = 6;
                break;
            case "7":
                month = 7;
                break;
            case "8":
                month = 8;
                break;
            case "9":
                month = 9;
                break;
            case "10":
                month = 10;
                break;
            case "11":
                month = 11;
                break;
        }
        let currentdate = new Date();
        let year = currentdate.getFullYear();
        let oneJan = new Date(currentdate.getFullYear(), 0, 1); // 1 de enero del anyo actual
        let dia1 = new Date(currentdate.getFullYear(), month, 1);
        let diaFin = new Date(year, month + 1, 1); // ultimo dia del mes pasado por parametro
        diaFin.setFullYear(year);
        let numDays = Math.floor((dia1 - oneJan) / (24 * 60 * 60 * 1000));
        let result = Math.ceil((numDays) / 7);
        let numberOfDays2 = Math.floor((diaFin - oneJan) / (24 * 60 * 60 * 1000)) - 1;
        let result2 = Math.ceil((numberOfDays2) / 7);
        let numDays3 = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
        let result3 = Math.ceil((numDays3) / 7);
        res.json({
            ok: true,
            msg: 'Obtener semanas',
            result,
            result2,
            result3
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las semanas'
        });
    }
}

module.exports = {
    obtenerIslas,
    obtenerBloqueada,
    calcularSemanas
};