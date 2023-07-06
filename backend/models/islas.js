const { Schema, model, SchemaTypes } = require("mongoose");
const mongoose = require('mongoose');

var ObjetoSchema = new mongoose.Schema({
    nombre: {
        type: String
    },
    traslacion: [Number],
    escalado: [Number],
    rotacion: [Number],
    dia: {
        type: String
    }
});

var AvatarSchema = new mongoose.Schema({
    tipo: {
        type: String
    },
    modelos: [ObjetoSchema]
});

const IslasSchema = Schema({
    nombre: {
        type: String,
        unique: true,
    },
    posicion: [Number],
    escalado: [Number],
    rotacion: [Number],
    objetos: [ObjetoSchema],
    avatares: [AvatarSchema],
    bases: [ObjetoSchema]
}, { collection: "islas" });

IslasSchema.method("toJSON", function() {
    const { __v, ...object } = this.toObject();

    return object;
});

module.exports = model("Islas", IslasSchema);