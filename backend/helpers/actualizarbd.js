const Plato = require('../models/platos');
const fs = require('fs');

const actualizarBD = async(path, nombreArchivo, id) => {

    const plato = await Plato.findById(id);

    if (!plato) {
        return false;
    }

    if(plato){
        const fotoVieja = plato.imagen;
        
        let pathFotoVieja = '';
        if(process.env.NODE_ENV === 'produccion') {
            pathFotoVieja = `../../www/html/assets/img/platos/${fotoVieja}`;
        } else {
            pathFotoVieja = `../frontend/src/assets/img/platos/${fotoVieja}`;
        }
        
        if (fotoVieja && fotoVieja !== "" && fs.existsSync(pathFotoVieja)) {
            fs.unlinkSync(pathFotoVieja);
        }
        plato.imagen = nombreArchivo;
        await plato.save();

        return true;
    }
}

module.exports = { actualizarBD }