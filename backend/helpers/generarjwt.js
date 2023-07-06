const jwt = require("jsonwebtoken");

const generarJWT = (uid, rol) => {
    return new Promise((resolve, reject) => {
        const payload = {
            uid,
            rol
        };

        const caducidad = {
            expiresIn: '1y'        
        }

        if(process.env.NODE_ENV == 'produccion') {
            caducidad.expiresIn = '24h';
        }

        // Se firma el payload con la clave, durará el tiempo puesto en expirseIn,
        // y devolverá un error o el token
        jwt.sign(
            payload,
            process.env.JWTSECRET,
            caducidad,
            (err, token) => {
                if (err) {
                    console.error(err);
                    reject("No se pudo generar el JWT");
                } else {
                    resolve(token);
                }
            }
        );
    });
};

module.exports = { generarJWT };
