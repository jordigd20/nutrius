// Generador de identificadores únicos para campos que sean unique
//const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const util = require('util');
const fs = require('fs');

const Plato = require('../models/platos');
const Usuario = require('../models/usuarios');
const Perfil = require('../models/perfiles');
const Menu = require('../models/menus');
const Recompensa = require('../models/recompensas');
const Premium = require('../models/premium');
const Facturacion = require('../models/facturacion');
const Seguimiento = require('../models/seguimiento-peso');
const PlatoPerfil = require('../models/plato_perfil');
const MenuPerfil = require('../models/menu_perfil');
const Islas = require('../models/islas');

require('dotenv').config({ path: '../.env' });

const { conexionBD } = require('../database/configbd');
conexionBD();

const crearMenus = async() => {
    const nombreMenus1 = ["Mercurio", "Venus", "Tierra", "Marte", "Júpiter", "Saturno", "Urano", "Neptuno", "Plutón", "Luna", "Sol", "Galaxia", "Mar", "Océano", "Lago", "Jardín", "Parque", "Desierto", "Bosque", "Jungla"];
    const nombreMenus2 = ["Red", "Pink", "Blue", "Green", "White", "Yellow", "Orange", "Purple", "Black", "Grey", "Coral", "Aquamarine", "Brown", "Cyan", "Crimson", "Violet", "Beige", "Azure", "Navy", "Silver", "Gold", "Magenta", "Lime"];

    var nombreMenu = nombreMenus1[Math.floor((Math.random() * (nombreMenus1.length - 1)))] + " " + nombreMenus2[Math.floor((Math.random() * (nombreMenus2.length - 1)))] + " " + Math.floor(Math.random() * 100);

    const obj = Math.floor(Math.random() * 3) + 1;
    const prefech = [1, 2, 3, 4];
    var fech = [];
    var fechpick = Math.floor(Math.random() * prefech.length);
    for (var i = 0; i < fechpick; i++) {
        var intonuev = prefech[Math.floor((Math.random() * prefech.length))];
        if (fech.indexOf(intonuev) == -1) {
            fech.push(intonuev);
        }
    }

    var menusemo = {
        lunes: { desayuno: [], almuerzo: [], comida: [], merienda: [], cena: [] },
        martes: { desayuno: [], almuerzo: [], comida: [], merienda: [], cena: [] },
        miercoles: { desayuno: [], almuerzo: [], comida: [], merienda: [], cena: [] },
        jueves: { desayuno: [], almuerzo: [], comida: [], merienda: [], cena: [] },
        viernes: { desayuno: [], almuerzo: [], comida: [], merienda: [], cena: [] },
        sabado: { desayuno: [], almuerzo: [], comida: [], merienda: [], cena: [] },
        domingo: { desayuno: [], almuerzo: [], comida: [], merienda: [], cena: [] }
    }

    let data = fs.readFileSync('../../frontend/src/assets/json/elementos.json', 'utf8');
    var platosUsados = [];
    for (var x = 0; x < 7; x++) {
        for (var z = 0; z < 5; z++) {
            let jsondat = JSON.parse(data);

            let dia = jsondat[4].elementos[x].propiedad;
            let comida = jsondat[2].elementos[z].propiedad;
            let numo = Math.floor(Math.random() * 3) + 1;
            platosUsados = [];
            for (let t = 0; t < numo; t++) {
                //buscar plato
                var platicoid = await randomPlato();
                let added = false;
                while (!added) {
                    //Comprueba que no se repita un plato en la misma comida
                    if (!platosUsados.includes(platicoid)) {
                        menusemo[dia][comida].push({ "plato": "" + platicoid + "" });
                        platosUsados.push(platicoid);
                        added = true;
                    } else {
                        platicoid = await randomPlato();
                    }
                }
            }
        }
    }

    const datos = {
        nombre: nombreMenu,
        objetivo: obj,
        fecharec: fech,
        menusem: menusemo
    };
    const existeMenu = await Menu.findOne({ nombre: nombreMenu });
    if (!existeMenu) {
        console.log(datos);
        const nuevoMenu = new Menu(datos);
        await nuevoMenu.save();
    }

}

const crearPlatos = async(e) => {
    const nombrePlatos1M = ["Arroz", "Rollito", "Estofado", "Pollo", "Pavo", "Lomo", "Atún", "Salmón", "Cerdo", "Yogur", "Puré", "Taco", "Flan", "Pato", "Cordero"];
    const nombrePlatos2M = ["frito", "al pesto", "cocido", "hervido", "con queso", "al horno", "gratinado", "a las finas hierbas", "con tomate", "con verduras", "especiado", "picante", "japonés", "italiano", "griego", "caliente", "frío"];
    const nombrePlatos1F = ["Hamburguesa", "Pizza", "Crema", "Ensalada", "Ternera", "Lubina", "Pasta", "Sepia", "Leche", "Mousse", "Tarta", "Fresa", "Sopa"];
    const nombrePlatos2F = ["frita", "cocida", "al pesto", "hervida", "al horno", "con queso", "gratinada", "a las finas hierbas", "con tomate", "con verduras", "especiada", "picante", "rusa", "tailandesa", "española", "francesa", "caliente", "fría"];

    var nombrePlato = "";
    var pickvar = Math.round(Math.random());
    if (pickvar == 0) {
        nombrePlato = nombrePlatos1M[Math.floor((Math.random() * (nombrePlatos1M.length - 1)))] + " " + nombrePlatos2M[Math.floor((Math.random() * (nombrePlatos2M.length - 1)))];
    } else {
        nombrePlato = nombrePlatos1F[Math.floor((Math.random() * (nombrePlatos1F.length - 1)))] + " " + nombrePlatos2F[Math.floor((Math.random() * (nombrePlatos2F.length - 1)))];
    }

    const precomis = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];
    var comis = [];
    var compick = Math.floor(Math.random() * (precomis.length - 1)) + 1;
    for (var i = 0; i < compick; i++) {
        var intonuev = precomis[Math.floor((Math.random() * (precomis.length - 1)))];
        if (comis.indexOf(intonuev) == -1) {
            comis.push(intonuev);
        }
    }
    const preinto = ["cacahuetes", "crustaceos", "moluscos", "gluten", "huevos", "lacteos", "pescado"];
    var into = [];
    var intpick = Math.floor(Math.random() * (preinto.length - 1));
    for (var i = 0; i < intpick; i++) {
        var intonuev = preinto[Math.floor((Math.random() * (preinto.length - 1)))];
        if (into.indexOf(intonuev) == -1) {
            into.push(intonuev);
        }
    }

    var datos = {};

    const existePlato = await Plato.findOne({ nombre: nombrePlato });
    if (!existePlato) {
        if (e == 0) {
            datos = {
                nombre: nombrePlato,
                comida: comis,
                intolerancias: into,
                usuario_id: null
            };
            console.log(datos);
            const nuevoPlato = new Plato(datos);
            await nuevoPlato.save();
        } else if (e == 1) {
            var usuido = await randomUsuario(0);
            datos = {
                nombre: nombrePlato,
                comida: comis,
                intolerancias: into,
                usuario_id: usuido
            };
            console.log(datos);
            const nuevoPlatoUsu = new Plato(datos);
            await nuevoPlatoUsu.save();
        }
    }

}


const crearUsuarios = async(e, completarDatos) => {
    const nombreUsuarios = ["Jose", "Juan", "Alicia", "Julia", "Pepe", "Manuel", "Raúl", "Laura", "Beatriz", "Carlos", "Jordi", "Mikaela", "Luisa", "Ana", "David", "Pedro", "Marc", "Sara", "Adrián", "Peter", "Hugo", "Mario", "Clara", "Rubén", "Aitana", "Helena", "Paula", "Inés", "Irene", "Lucía", "Ramón"];
    const apellidosUsuarios = ["Martínez", "García", "Fernández", "Orea", "Sansano", "Cabezuelos", "Tchirichián", "Velázquez", "Roca", "Sempere", "Zaragoza", "Pérez", "Olivares", "Arenas", "Sánchez", "Parker", "Rodríguez", "Casas", "Calzada", "Samper", "Gonsálbez", "Escobar", "Molina", "Tébar", "Doe", "Blanco", "Wilde", "Márquez"];
    const rolUsu = ["ROL_USUARIO", "ROL_PREMIUM", "ROL_USUARIO"];
    const nomb_us = nombreUsuarios[Math.floor((Math.random() * (nombreUsuarios.length - 1)))];
    const ap_us = apellidosUsuarios[Math.floor((Math.random() * (apellidosUsuarios.length - 1)))];
    const nom_us = nomb_us + " " + ap_us;
    var emnom2 = ((nomb_us.substring(0, 3)).toLowerCase()).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var emap3 = ((ap_us.substring(0, 3)).toLowerCase()).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var ranumb = Math.floor(Math.random() * 10000);
    const emailo = emnom2 + emap3 + ranumb + "@gmail.com";
    const passo = "1234";
    var rolo = rolUsu[Math.floor((Math.random() * (rolUsu.length - 1)))];
    if (e == 1) {
        rolo = "ROL_USUARIO";
    } else if (e == 2) {
        rolo = "ROL_PREMIUM";
    }
    var prem = false;
    if (rolo === "ROL_PREMIUM") {
        prem = true;
    }

    const datos = {
        nombre_usuario: nom_us,
        email: emailo,
        password: passo,
        rol: rolo,
        premium: prem,
        estado: "Activo"
    };

    const existeEmail = await Usuario.findOne({ email: emailo });
    console.log(existeEmail);
    if (!existeEmail) {
        const nuevoUsu = new Usuario(datos);
        console.log(nuevoUsu);

        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(nuevoUsu.password, salt);
        nuevoUsu.password = cpassword;

        await nuevoUsu.save();

        var perfpick = Math.floor(Math.random() * (4)) + 1;
        console.log('numero de perfiles: ' + perfpick);

        const arrayPerfiles = nuevoUsu.perfiles;

        for (var j = 0; j < perfpick; j++) {
            const datosPerfil = await crearPerfiles(nuevoUsu._id);
            arrayPerfiles.push(datosPerfil.id);
            if (completarDatos) {
                await crearMenuActualYSiguiente(arrayPerfiles[j], new Date());
                await crearSeguimiento(arrayPerfiles[j]);
                for(let i = 0; i < 3; i++) {
                    await crearRecompensas(arrayPerfiles[j]);
                }
            }
        }

        await Usuario.findByIdAndUpdate(nuevoUsu._id, { perfiles: arrayPerfiles }, { new: true });

        if (nuevoUsu.premium == true) {
            await crearPremium(nuevoUsu._id);
            if (completarDatos) await crearFacturacion(nuevoUsu._id);
        }

    }


}

const crearPerfiles = async(usu) => {
    const nombrePerfilesM = ["Jose", "Juan", "Ale", "Sam", "Pepito", "Manuel", "Luis", "Raúl", "Carlos", "Jordi", "David", "Pedro", "Marc", "Adrián", "Peter", "Hugo", "Mario", "Rubén", "Javi", "Nico"];
    const nombrePerfilesF = ["Ale", "Alicia", "Sam", "Julia", "Tere", "Laura", "Beatriz", "Mikaela", "Luisa", "Ana", "Sara", "Clara", "Aitana", "Helena", "Paula", "Inés", "Irene", "Lucía", "Lisa"];
    const listaApellidos = ["Martínez", "García", "Fernández", "Orea", "Sansano", "Cabezuelos", "Tchirichián", "Velázquez", "Roca", "Sempere", "Zaragoza", "Pérez", "Olivares", "Arenas", "Sánchez", "Parker", "Rodríguez", "Casas", "Calzada", "Samper", "Gonsálbez", "Escobar", "Molina", "Tébar", "Doe", "Blanco", "Wilde", "Márquez"];
    const fecha_nac = randomDate(new Date(2015, 0, 1), new Date());
    let fecha_obj = randomDate(new Date(2022, 0, 1), new Date());
    var nomb_perf = "";
    var sex = "";
    var pickvar = Math.round(Math.random());
    if (pickvar == 0) {
        nomb_perf = nombrePerfilesM[Math.floor((Math.random() * (nombrePerfilesM.length - 1)))];
        sex = "NIÑO";
    } else {
        nomb_perf = nombrePerfilesF[Math.floor((Math.random() * (nombrePerfilesF.length - 1)))];
        sex = "NIÑA";
    }
    const nuevoApellido = listaApellidos[Math.floor((Math.random() * (listaApellidos.length - 1)))];

    const listaAvatares = ['1', '2', '3'];
    let avatar = '../../../assets/img/avatar';
    avatar += `${listaAvatares[Math.floor((Math.random() * (listaAvatares.length - 1)))]}.jpeg`;

    const peso_act = Math.floor(Math.random() * (40 - 10)) + 10;
    let peso_obj = Math.floor(Math.random() * (40 - 10)) + 10;
    const altura_act = Math.floor(Math.random() * (130 - 100)) + 100;
    const preobj = ["Bajar de peso", "Subir de peso", "Dieta saludable"];
    const obj = preobj[Math.floor((Math.random() * preobj.length))];
    const preinto = ["cacahuetes", "crustaceos", "moluscos", "gluten", "huevos", "lacteos", "pescado"];
    var into = [];
    var intpick = Math.floor(Math.random() * (preinto.length - 1));
    for (var i = 0; i < intpick; i++) {
        var intonuev = preinto[Math.floor((Math.random() * (preinto.length - 1)))];
        if (into.indexOf(intonuev) == -1) {
            into.push(intonuev);
        }
    }

    if (obj === "Dieta saludable") {
        peso_obj = -1;
    }

    const datos = {
        nombre: nomb_perf,
        apellidos: nuevoApellido,
        usuario: usu,
        fecha_nacimiento: fecha_nac,
        sexo: sex,
        peso_actual: peso_act,
        altura_actual: altura_act,
        peso_objetivo: peso_obj,
        fecha_objetivo: fecha_obj,
        objetivo: obj,
        intolerancias: into,
        avatar: avatar
    };
    console.log(datos);
    const nuevoPerf = new Perfil(datos);
    await nuevoPerf.save();

    return nuevoPerf;
}

const crearRecompensas = async(idPerfil) => {
    const nombreRec1 = ["Ir a", "Ver", "Comprar", "Pasear por", "Visitar", "Jugar en", "Comer en", "Llamar a", "Cenar en", "Merendar en", "Desayunar en", "Almorzar en", "Regalar en", "Bailar en", "Participar en", "Grabar en", "Hacer fotos en", "Leer en", "Escuchar música en"];
    const nombreRec2 = ["el parque", "el cine", "el campo", "la playa", "el pueblo", "el bosque", "el restaurante", "el mar", "el centro", "el centro comercial", "la tienda", "la juguetería", "el teatro", "la fiesta", "el puerto", "la montaña", "la casa", "la ciudad", "el concierto"];
    const nombreRec = nombreRec1[Math.floor((Math.random() * (nombreRec1.length - 1)))] + " " + nombreRec2[Math.floor((Math.random() * (nombreRec2.length - 1)))] + " " + Math.floor(Math.random() * 1000);

    const puntits = Math.floor(Math.random() * (2000 - 100)) + 100;
    var canjead = false;
    var pickvar = Math.round(Math.random());
    if (pickvar == 0) {
        canjead = true;
    }

    let idperf = idPerfil;
    if(idperf == '0') idperf = await randomPerfil();

    const datos = {
        pid: idperf,
        nombre: nombreRec,
        puntos: puntits,
        canjeada: canjead
    };

    const existeRecompensa = await Recompensa.findOne({ nombre: nombreRec });
    if (!existeRecompensa) {
        console.log(datos);
        const nuevaRec = new Recompensa(datos);
        await nuevaRec.save();
    }

}

const crearPremium = async(usu) => {
    let datos = {};
    const planesPrem = ["1 mes", "3 meses", "6 meses", "1 año"];
    var plano = planesPrem[Math.floor((Math.random() * planesPrem.length))];
    var durac = 0;
    var preci = 0;
    switch (plano) {
        case '1 mes':
            durac = 30;
            preci = 3.99;
            break;
        case '3 meses':
            durac = 90;
            preci = 8.99;
            break;
        case '6 meses':
            durac = 180;
            preci = 12.99;
            break;
        case '1 año':
            durac = 365;
            preci = 18.99;
            break;
        default:
            break;
    }
    var metpag = 1; //Tarjeta de credito
    var pickvar = Math.round(Math.random());
    if (pickvar == 0) {
        metpag = 2; //Paypal
    }

    let nuevaSubscripcionId = 'I-';
    if (metpag === 2) {
        const caracteresPosibles = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < 12; i++) {
            nuevaSubscripcionId += caracteresPosibles.charAt(
                Math.floor(Math.random() * caracteresPosibles.length)
            );
        }
        datos.subscripcion_id = nuevaSubscripcionId;
    }

    const dias = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
        '13', '14', '15', '16', '17', '18', '19', '20', '21', '22',
        '23', '24', '25', '26', '27', '28', '29',
    ];
    const meses = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

    const diaAleatorio = dias[Math.floor(Math.random() * dias.length)];
    const mesAleatorio = meses[Math.floor(Math.random() * meses.length)];
    const fechain = new Date(2022, mesAleatorio, diaAleatorio);

    var idperf = "0";

    if (usu == "0") {
        idperf = await randomUsuario(1);
    } else {
        idperf = usu;
    }

    datos.usuario_id = idperf,
        datos.plan = plano,
        datos.metodo_pago = metpag,
        datos.fecha_inicio = fechain,
        datos.duracion = durac,
        datos.precio = preci,
        datos.activo = true

    console.log(datos);
    const nuevoPrem = new Premium(datos);
    await nuevoPrem.save();

    if (usu == "0") {
        const existeUsuario = await Usuario.findById(idperf);
        await Usuario.findByIdAndUpdate(existeUsuario, { premium: true, rol: "ROL_PREMIUM" }, { new: true });
    }

}

const crearFacturacion = async(uid) => {
    var usuario_id = uid;
    var boolo = false;
    if(usuario_id == '0') {
        do {
            usuario_id = await randomUsuario(0);
            let factura = await Facturacion.findOne({ "uid": usuario_id });
            if (!factura) {
                boolo = true;
            }
        } while (boolo == false);
    }

    let usu = await Usuario.findById(usuario_id);
    var nombreUsu = usu.nombre_usuario.toString().split(" ")[0];
    var apelliUsu = usu.nombre_usuario.toString().split(" ")[1];

    const fechnac = randomDate(new Date(1950, 0, 1), new Date(2003, 0, 1));

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomCharacter = alphabet[Math.floor(Math.random() * alphabet.length)];
    const dni = (Math.floor(Math.random() * (99999999 - 11111111)) + 11111111) + randomCharacter;

    const movil = (Math.floor(Math.random() * (999999999 - 111111111)) + 111111111);

    const direcs1 = ["Calle", "Avenida", "Camino", "Plaza"];
    const direcs2 = ["Lirio", "Rosa", "Campanilla", "Clavel", "Alfalfa", "Trébol", "Amapola", "Jazmín", "Lavanda", "Margarita", "Orquídea", "Narciso", "Tulipán", "Dalia"];
    const direc = direcs1[Math.floor((Math.random() * (direcs1.length - 1)))] + " " + direcs2[Math.floor((Math.random() * (direcs2.length - 1)))] + " " + Math.floor(Math.random() * 50);

    const piso = (Math.floor(Math.random() * 12));
    const cod_post = (Math.floor(Math.random() * (99999 - 11111)) + 11111);

    const poblacs = ["San Vicente", "Elche", "Benidorm", "Tiriez", "Berro", "Sahúco", "Orihuela", "Onil", "Ibi", "Castalla", "Mula", "Lobo", "Tennessee"];
    const provins = ["Alicante", "Valencia", "Castellón", "Albacete", "Barcelona", "Madrid", "Buenos Aires", "Santander", "Sevilla", "Tokio", "Granada", "Murcia", "Bilbao", "Londres", "Nueva York", "Budapest", "Viena", "Ámsterdam", "Roma", "Florencia"];
    const paises = ["España", "Italia", "Francia", "Alemania", "Argentina", "Brasil", "Cuba", "Panamá", "Perú", "Noruega", "Inglaterra", "Bulgaria", "China", "Japón", "Estados Unidos"];

    const poblac = poblacs[Math.floor((Math.random() * (poblacs.length - 1)))];
    const provin = provins[Math.floor((Math.random() * (provins.length - 1)))];
    const pais = paises[Math.floor((Math.random() * (paises.length - 1)))];

    const datos = {
        uid: usuario_id,
        nombre: nombreUsu,
        apellidos: apelliUsu,
        fecha_nacimiento: fechnac,
        dni: dni,
        movil: movil,
        direccion: direc,
        piso: piso,
        codigo_postal: cod_post,
        poblacion: poblac,
        provincia: provin,
        pais: pais
    };
    console.log(datos);
    const nuevaFact = new Facturacion(datos);
    await nuevaFact.save();
}

const crearSeguimiento = async(idPerfil) => {
    var idperf = idPerfil;
    if(idperf == '0') idperf = await randomPerfil();
    const fech = Date.now();
    [ultimoSeguimiento, perfil] = await Promise.all([
        Seguimiento.findOne({ idperf, fecha: { $lt: fech } }).sort({ fecha: -1 }),
        Perfil.findById(idperf)
    ]);
    const pes = Math.floor(Math.random() * (40 - 10)) + 10;
    const altur = Math.floor(Math.random() * (130 - 100)) + 100;

    const totalRegistros = await Seguimiento.find({ pid: idperf });

    let variac = 0;
    if (totalRegistros.length !== 0 && ultimoSeguimiento) {
        variac = pes - ultimoSeguimiento.peso;
        if (!Number.isInteger(variac)) {
            variac = Number.parseFloat(variac).toFixed(2);
        }
    }

    let difObj = null;
    if (perfil.peso_objetivo != -1) {
        let difObj = Math.abs(pes - perfil.peso_objetivo);
        if (!Number.isInteger(difObj)) {
            difObj = Number.parseFloat(difObj).toFixed(2);
        }   
    } 

    const datos = {
        pid: idperf,
        fecha: fech,
        peso: pes,
        altura: altur,
        variacion: variac,
        difObjetivo: difObj
    };
    console.log(datos);
    const nuevoSeg = new Seguimiento(datos);
    await nuevoSeg.save();

    await Perfil.findByIdAndUpdate(idperf, { peso_actual: pes, altura_actual: altur }, { new: true });

}

const crearPlatoPerfil = async(platid, perfid, comida, fech) => {
    var idperf = perfid;
    var idplat = platid;

    var vgust = 0;
    var vnogust = 0;
    var vfall = 0;

    var comp = false;
    var gustad = false;
    var marcad = true;
    var pickvar = Math.round(Math.random());
    if (pickvar == 0) {
        comp = true;
        var pickvar2 = Math.round(Math.random());
        if (pickvar2 == 0) {
            gustad = true;
            vgust++;
        } else {
            vnogust++;
        }
    } else {
        var pickvar2 = Math.round(Math.random());
        if (pickvar2 == 0) {
            vfall++;
        } else {
            marcad = false;
        }

    }

    var infoplat = {
        completado: comp,
        gustado: gustad,
        marcado: marcad,
        fecha: fech,
        comida: comida
    }

    let existePPerfil = await PlatoPerfil.findOne({ "plato_id": idplat, "perfil_id": idperf });

    if (existePPerfil) {
        existePPerfil.info_plato.push(infoplat);
        await existePPerfil.save();

        vgust += existePPerfil.veces_gustado;
        vnogust += existePPerfil.veces_no_gustado;
        vfall += existePPerfil.veces_fallado;

        var idoComp2 = existePPerfil._id;
        var idoCool2 = idoComp2.toString().split('\"').pop().split('\"')[0];

        await PlatoPerfil.findByIdAndUpdate(idoCool2, { veces_gustado: vgust, veces_no_gustado: vnogust, veces_fallado: vfall }, { new: true });

    } else {
        const datos = {
            perfil_id: idperf,
            plato_id: idplat,
            veces_gustado: vgust,
            veces_no_gustado: vnogust,
            veces_fallado: vfall,
            info_plato: infoplat
        };
        console.log(datos);
        const nuevoPP = new PlatoPerfil(datos);
        await nuevoPP.save();

        existePPerfil = nuevoPP;
    }

    console.log(infoplat);


    return existePPerfil;
}

const crearMenuPerfil = async(perfid, fechaMenu) => {
    var idperf = "";
    if (perfid !== "0") {
        idperf = perfid;
    } else {
        idperf = await randomPerfil();
    }
    var idmen = await randomMenu();

    crearDatosMenuPerfil(idperf, idmen, fechaMenu);
}

const restarDias = (fecha) => {
    let res = new Date(fecha);
    res.setDate(res.getDate() - 1);
    return res;
}

const crearDatosMenuPerfil = async(idperf, idmen, fechaMenu) => {
    let menunormal = await Menu.findById(idmen);
    // elegir menu q coincida con objetivo perfil ??
    var puntsxm = 0;
    var eficac = 0;
    var comfall = 0;
    var totalPlatos = 0;
    var puntplat = 0;

    const sem = getNumeroSemana(new Date(fechaMenu.getTime()));

    var menusemo = {
        lunes: { fecha: 0, comidas: { desayuno: {}, almuerzo: {}, comida: {}, merienda: {}, cena: {} } },
        martes: { fecha: 0, comidas: { desayuno: {}, almuerzo: {}, comida: {}, merienda: {}, cena: {} } },
        miercoles: { fecha: 0, comidas: { desayuno: {}, almuerzo: {}, comida: {}, merienda: {}, cena: {} } },
        jueves: { fecha: 0, comidas: { desayuno: {}, almuerzo: {}, comida: {}, merienda: {}, cena: {} } },
        viernes: { fecha: 0, comidas: { desayuno: {}, almuerzo: {}, comida: {}, merienda: {}, cena: {} } },
        sabado: { fecha: 0, comidas: { desayuno: {}, almuerzo: {}, comida: {}, merienda: {}, cena: {} } },
        domingo: { fecha: 0, comidas: { desayuno: {}, almuerzo: {}, comida: {}, merienda: {}, cena: {} } }
    }

    let data = fs.readFileSync('../../frontend/src/assets/json/elementos.json', 'utf8');

    let fech = new Date(fechaMenu);
    let esLunes = false;
    while (!esLunes) {
        if (fech.getDay() == 1) {
            esLunes = true;
        } else {
            fech = restarDias(fech);
        }
    }
    for (var x = 0; x < 7; x++) {
        for (var z = 0; z < 5; z++) {
            // let resta = x - (day - 1);
            let dag = new Date(fech);
            // dag.setDate(fech.getDate() + resta);
            let jsondat = JSON.parse(data);
            let dia = jsondat[4].elementos[x].propiedad;
            let comida = jsondat[2].elementos[z].propiedad;
            // desayuno-> 15; alm-> 10; comida-> 25; mer->15; cena->20
            puntplat = jsondat[2].elementos[z].puntos;
            let numo = menunormal.menusem[dia][comida].length;
            let platoscomi = [];
            let comidacomp = true;
            for (let t = 0; t < numo; t++) {
                totalPlatos++;
                let plater = menunormal.menusem[dia][comida][t].plato;
                var idoComp2 = plater;
                var idoCool2 = idoComp2.toString().split('\"').pop().split('\"')[0];
                var platico = await crearPlatoPerfil(idoCool2, idperf, comida, fech);
                var ultimoInfoP = platico.info_plato.length - 1;
                var complet = platico.info_plato[ultimoInfoP].marcado;
                var fallad = platico.info_plato[ultimoInfoP].completado;
                
                if (fallad == false) {
                    comfall++;
                    comidacomp = false;
                } else {
                    puntsxm += puntplat;
                }
                platoscomi.push({
                    plato: platico,
                    completado: complet,
                    fallado: fallad
                });
            }

            menusemo[dia].fecha = dag;
            menusemo[dia].comidas[comida] = {
                puntos: puntplat,
                completada: comidacomp,
                platos: platoscomi
            };
        }
        fech = sumarDias(fech);
    }

    eficac = Math.round(((totalPlatos - comfall) * 100) / totalPlatos);

    // Asignar una isla diferente a la que haya en el registro de islas del perfil
    const perfil = await Perfil.findById(idperf);
    console.log(perfil);
    let islasNoDisponibles = perfil.islas;
    if (islasNoDisponibles.length == 5) {
        islasNoDisponibles = [];
    }

    let queryIslas = { _id: { $nin: islasNoDisponibles }, nombre: { $not: { $regex: new RegExp("isla1-base-bloqueado") } } };

    if (islasNoDisponibles.length == 0) {
        queryIslas = { nombre: { $not: { $regex: new RegExp("isla1-base-bloqueado") } } };
    }

    const nuevaIsla = await Islas.findOne(queryIslas);
    islasNoDisponibles.push(nuevaIsla._id);

    const puntos = perfil.puntos_ganados + puntsxm;
    // Se añade a las islas del perfil
    await Perfil.findByIdAndUpdate(idperf, { islas: islasNoDisponibles, puntos_ganados: puntos });

    // Meses involucrados en la semana actual
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mesesSemana = getMesesDeLaSemanaActual(fechaMenu);
    const stringMeses = [];

    for (let i = 0; i < mesesSemana.length; i++) {
        stringMeses.push(meses[mesesSemana[i]]);
    }

    const islaObjetos = await Islas.findById(nuevaIsla._id);
    let listaObjetos = [];
    let objeto = new Object();
    for (let i = 0; i < islaObjetos.objetos.length; i++) {
        objeto = new Object();
        objeto.id = islaObjetos.objetos[i]._id.toString();
        objeto.desbloqueado = false;
        objeto.dia = islaObjetos.objetos[i].dia;
        listaObjetos.push(objeto);
    }

    const isla = {
        meses: stringMeses,
        isla: nuevaIsla._id,
        objetos: listaObjetos
    }

    const datos = {
        menu_id: idmen,
        perfil_id: idperf,
        semana: sem,
        comidas_falladas: comfall,
        eficacia: eficac,
        puntos_obtenidos: puntsxm,
        menusem: menusemo,
        isla: isla
    };
    console.log(datos);
    const nuevoMP = new MenuPerfil(datos);
    await nuevoMP.save();
}

const crearIslas = async() => {

    let data = fs.readFileSync('../../frontend/src/assets/json/islas.json', 'utf8');
    let jsondat = JSON.parse(data);

    for (let i = 0; i < jsondat.length; i++) {

        var objs = [];
        if (jsondat[i].objetos) {
            for (let y = 0; y < jsondat[i].objetos.length; y++) {
                var obj = {
                    nombre: jsondat[i].objetos[y].nombre,
                    traslacion: jsondat[i].objetos[y].traslacion,
                    escalado: jsondat[i].objetos[y].escalado,
                    rotacion: jsondat[i].objetos[y].rotacion,
                    dia: jsondat[i].objetos[y].dia,
                }
                objs.push(obj);
            }
        }

        var avs = [];
        if (jsondat[i].avatares) {
            for (let y = 0; y < jsondat[i].avatares.length; y++) {
                var mods = [];
                for (let j = 0; j < jsondat[i].avatares[y].modelos.length; j++) {
                    var mod = {
                        nombre: jsondat[i].avatares[y].modelos[j].nombre,
                        traslacion: jsondat[i].avatares[y].modelos[j].traslacion,
                        escalado: jsondat[i].avatares[y].modelos[j].escalado,
                        rotacion: jsondat[i].avatares[y].modelos[j].rotacion,
                        dia: jsondat[i].avatares[y].modelos[j].dia,
                    }
                    mods.push(mod);
                }
                var av = {
                    tipo: jsondat[i].avatares[y].tipo,
                    modelos: mods
                }
                avs.push(av);
            }
        }

        var bas = [];
        if (jsondat[i].bases) {
            for (let y = 0; y < jsondat[i].bases.length; y++) {
                var ba = {
                    nombre: jsondat[i].bases[y].nombre,
                    traslacion: jsondat[i].bases[y].traslacion,
                    escalado: jsondat[i].bases[y].escalado,
                    rotacion: jsondat[i].bases[y].rotacion,
                    dia: jsondat[i].bases[y].dia,
                }
                bas.push(ba);
            }
        }

        const datos = {
            _id: jsondat[i]._id['$oid'],
            nombre: jsondat[i].nombre,
            posicion: jsondat[i].posicion,
            escalado: jsondat[i].escalado,
            rotacion: jsondat[i].rotacion,
            objetos: objs,
            avatares: avs,
            bases: bas
        };

        const existeIsla = await Islas.findOne({ nombre: jsondat[i].nombre });
        if (!existeIsla) {
            console.log(datos);
            const nuevaIsla = new Islas(datos);
            await nuevaIsla.save();
        } else {
            console.log('Ya existe la isla ' + jsondat[i].nombre);
        }
    }

}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const randomPlato = async() => {
    let platos, total;
    [platos, total] = await Promise.all([
        Plato.find(),
        Plato.countDocuments(),
    ]);
    var platpick = Math.floor(Math.random() * (total - 1));
    var idoComp = platos[platpick]._id;
    var idoCool = idoComp.toString().split('\"').pop().split('\"')[0];
    console.log('randomPlato: ' + idoCool);

    return idoCool;
}

const getMesesDeLaSemanaActual = (fechaMenu) => {
    const fechaActual = new Date(fechaMenu.getTime());
    const diaSemana = fechaActual.getDay();
    let diasRestantes = 7 - diaSemana;
    const meses = [];
    var mesesDefinitivos = [];

    // Si no es domingo
    if (diasRestantes !== 7) {

        for (let i = 0; i < diasRestantes; i++) {
            let fechaAux = fechaActual;
            fechaAux.setDate(fechaActual.getDate() + i);
            meses.push(fechaAux.getMonth());
        }

        // Eliminar meses duplicados
        for (let i = 0; i < meses.length; i++) {
            if (mesesDefinitivos.indexOf(meses[i]) === -1) {
                mesesDefinitivos.push(meses[i]);
            }
        }

    } else {
        mesesDefinitivos[0] = fechaActual.getMonth();
    }

    return mesesDefinitivos;
}

const randomMenu = async() => {
    let menus, total;
    [menus, total] = await Promise.all([
        Menu.find(),
        Menu.countDocuments(),
    ]);
    var menpick = Math.floor(Math.random() * (total - 1));
    var idoComp = menus[menpick]._id;
    var idoCool = idoComp.toString().split('\"').pop().split('\"')[0];
    console.log('randomMenu: ' + idoCool);

    return idoCool;
}

const randomPerfil = async() => {
    let perfiles, total;
    [perfiles, total] = await Promise.all([
        Perfil.find(),
        Perfil.countDocuments(),
    ]);
    var perfpick = Math.floor(Math.random() * (total - 1));
    var idoComp = perfiles[perfpick]._id;
    var idoCool = idoComp.toString().split('\"').pop().split('\"')[0];
    console.log('randomPerfil: ' + idoCool);

    return idoCool;
}

// 0 -> todos los usuarios; 1 -> solo usuarios no premium
const randomUsuario = async(e) => {
    let usuarios, total;
    let query = { rol: { $ne: "ROL_ADMIN" } };
    if (e == 1) {
        query = { rol: { $ne: "ROL_ADMIN" }, premium: false };
    }
    [usuarios, total] = await Promise.all([
        Usuario.find(query),
        Usuario.countDocuments(query),
    ]);

    if (e == 1 && usuarios.length == 0) {
        console.log('Todos los usuarios son premium');
    }

    var usupick = Math.floor(Math.random() * (total - 1));
    var idoComp = usuarios[usupick]._id;
    var idoCool = idoComp.toString().split('\"').pop().split('\"')[0];
    console.log('randomUsuario: ' + idoCool);

    return idoCool;
}

const getNumeroSemana = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

    return weekNumber;
}

const fechaSiguienteLunes = (f) => {
    let fecha = new Date();
    fecha.setDate(f.getDate());
    let esLunes = false;

    if (fecha.getDay() == 1) {
        fecha.setDate(fecha.getDate() + 7);
        return fecha;
    }

    while (!esLunes) {
        if (fecha.getDay() == 1) {
            esLunes = true;
        } else {
            fecha = sumarDias(fecha);
        }
    }

    return fecha;
}

const sumarDias = (fecha) => {
    let res = new Date(fecha);
    res.setDate(res.getDate() + 1);
    return res;
}

const crearMenuActualYSiguiente = async(perfid, fechaMenuActual) => {
    var idperf = "";
    if (perfid !== "0") {
        idperf = perfid;
    } else {
        idperf = await randomPerfil();
    }
    var idmen = await randomMenu();

    crearDatosMenuPerfil(idperf, idmen, fechaMenuActual);

    const siguienteLunes = fechaSiguienteLunes(fechaMenuActual);
    var idMenu2 = await randomMenu();
    crearDatosMenuPerfil(idperf, idMenu2, siguienteLunes);
}

for (let index = 0; index < 1; index++) { // indicar el numero de datos q se quieren crear
    // crearPlatos(0); // 0 -> plato normal; 1 -> plato normal con usuario
    // crearUsuarios(0, true); // 0 -> premium&normales; 1 -> solo normales; 2 -> solo premium | true -> para crear los MenuPerfil a los perfiles
    // crearMenus();
    // crearRecompensas();
    // crearPremium("0");
    // crearFacturacion("628f5423e7c5f3aa62edb14a"); // "0" -> usuario aleatorio; "23473.."(id usuario) -> ese usuario //puede causar bucle si todos los usuarios tienen ya factura
    // crearSeguimiento('0'); // "0" -> perfil aleatorio; "23473.."(id perfil) -> ese perfil
    // crearMenuActualYSiguiente('6286711fcfb7631dfed24164', new Date(2022, 4, 2)); // "0" -> perfil aleatorio; "23473.."(id perfil) -> ese perfil
    crearMenuPerfil('629a2e19a00a63e0a3752892', new Date(2022, 5, 27)); // "0" -> perfil aleatorio; "23473.."(id perfil) -> ese perfil
    // crearIslas();
}