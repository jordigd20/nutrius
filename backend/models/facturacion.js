const { Schema, model, SchemaTypes } = require("mongoose");

const FacturacionSchema = Schema({
    uid: {
        type: SchemaTypes.ObjectId,
        required: true,
        unique: true,
        ref: "Usuario"
    },
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    fecha_nacimiento: {
        type: Date,
        required: true
    },
    dni: {
        type: String,
        required: true
    },
    movil: {
        type: Number
    },
    direccion: {
        type: String,
        required: true
    },
    piso: {
        type: String,
        required: false
    },
    codigo_postal: {
        type: Number,
        required: true
    },
    poblacion: {
        type: Array,
        required: true
    },
    provincia: {
        type: Array,
        required: true
    },
    pais: {
        type: Array,
        required: true
    }
}, { collection: "facturacion" });

FacturacionSchema.method("toJSON", function() {
    const { __v, ...object } = this.toObject();

    return object;
});

module.exports = model("Facturacion", FacturacionSchema);