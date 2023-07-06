const { Schema, model } = require("mongoose");

const PerfilesSchema = Schema({
    nombre: {
        type: String,
        required: true,
    },
    apellidos: {
        type: String,
        required: true,
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fecha_nacimiento: {
        type: Date,
        required: true,
    },
    sexo: {
        type: String,
        required: true,
    },
    peso_actual: {
        type: Number,
        required: true,
    },
    altura_actual: {
        type: Number,
        required: true,
    },
    peso_objetivo: {
        type: Number,
        required: true,
    },
    fecha_objetivo: {
        type: Date
    },
    objetivo: {
        type: String,
        require: true
    },
    avatar: {
        type: String,
        require: true
    },
    intolerancias: {
        type: Array,
    },
    activo: {
        type: Boolean,
        default: true,
    },
    puntos_ganados: {
        type: Number,
        default: 0
    },
    islas: [{
        type: Schema.Types.ObjectId,
        ref: 'Islas'
    }]
}, { collection: "perfiles" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
PerfilesSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model("Perfil", PerfilesSchema);