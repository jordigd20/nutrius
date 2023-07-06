const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

var FechaSchema = new mongoose.Schema({
    completado: {
        type: Boolean,
        default: false
    },
    gustado: {
        type: Boolean,
        default: false
    },
    marcado: {
        type: Boolean,
        default: false
    },
    fecha: {
        type: Date
    },
    comida: {
        type: String
    }
});

const PlatoPerfilSchema = Schema({
    perfil_id: {
        type: Schema.Types.ObjectId,
        ref: 'Perfil'
    },
    plato_id: {
        type: Schema.Types.ObjectId,
        ref: 'Plato'
    },
    veces_gustado: {
        type: Number,
        default: 0
    },
    veces_no_gustado: {
        type: Number,
        default: 0
    },
    veces_fallado: {
        type: Number,
        default: 0
    },
    info_plato: [
        FechaSchema
    ]

}, { collection: "platoperfil" });

PlatoPerfilSchema.method("toJSON", function() {
    const { __v, ...object } = this.toObject();

    return object;
});

module.exports = model('PlatoPerfil', PlatoPerfilSchema);