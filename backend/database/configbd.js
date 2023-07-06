const mongoose = require('mongoose');
require('dotenv').config();

const conexionBD = async () => {
    try {

        if(process.env.NODE_ENV === 'produccion') {
            await mongoose.connect(process.env.CONEXIONBD, { user: process.env.MONGOUSER, pass: process.env.MONGOPASSWORD, useNewUrlParser: true });
        } else if (process.env.NODE_ENV === 'local') {
            await mongoose.connect(process.env.CONEXIONBD, { useNewUrlParser: true });
        }

        console.log('BD online');
    } catch (error) {
        console.error(error);
        throw new Error('Error al iniciar la BD')
    }
}

module.exports = { conexionBD };