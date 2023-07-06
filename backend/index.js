// Importación de Módulos
const express = require('express');
const cors = require("cors");
const { conexionBD } = require('./database/configbd');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// Aplicación de express
const app = express();

// Conexion a la BD
conexionBD();

// Middleware
app.use(cors());
app.use(express.json());

app.use(fileUpload({
    limits: { fileSize: process.env.MAXSIZEUPLOAD * 1024 * 1024 },
}));

// Rutas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/perfiles', require('./routes/perfiles'));
app.use('/api/platos', require('./routes/platos'));
app.use('/api/menus', require('./routes/menus'));

app.use('/api/recompensas', require('./routes/recompensas'));
app.use('/api/seguimiento', require('./routes/seguimiento'));
app.use('/api/facturacion', require('./routes/facturacion'));
app.use('/api/menu_perfil', require('./routes/menu_perfil'));
app.use('/api/plato_perfil', require('./routes/plato_perfil'));
app.use('/api/premium', require('./routes/premium'));
app.use('/api/pagos', require('./routes/pagos'));


app.use('/api/kid', require('./routes/kid'));
app.use('/api/islas', require('./routes/islas'));

app.use('/api/webhook', require('./routes/chatbot'));


// Escuchar en el puerto
app.listen(process.env.PUERTO, () => {
    console.log('Servidor escuchando en el puerto', process.env.PUERTO);
});