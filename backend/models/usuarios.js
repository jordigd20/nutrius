const { Schema, model, SchemaTypes } = require("mongoose");

const UsuarioSchema = Schema({
    nombre_usuario: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    rol: {
        type: String,
        required: true,
        default: "ROL_USUARIO",
    },
    premium: {
        type: Boolean,
        default: false
    },
    estado: {
        type: String,
        required: true,
        default: 'Pendiente'
    },
    perfiles: [{
        type: Schema.Types.ObjectId,
        ref: "Perfil"
    }],
    pin_parental: {
        type: Number,
        required: false,
        default: null
    },
}, { collection: "usuarios" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
UsuarioSchema.method("toJSON", function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Usuario", UsuarioSchema);