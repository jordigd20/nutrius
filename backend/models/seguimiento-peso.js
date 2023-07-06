const { Schema, model, SchemaTypes } = require("mongoose");

const SeguimientoPesoYAlturaSchema = Schema({
    pid: {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: "Perfil"
    },
    fecha: {
        type: Date,
        required: true
    },
    peso: {
        type: Number,
        required: true
    },
    altura: {
        type: Number,
        required: true
    },
    variacion: {
        type: Number
    },
    difObjetivo: {
        type: Number
    }
}, { collection: "seguimiento_peso" });

// Este método personaliza la información JSON que se envia, de esta manera
// está quitando los valores __v, _id, password para que no se envien en la API
SeguimientoPesoYAlturaSchema.method("toJSON", function() {
    const { __v, ...object } = this.toObject();

    return object;
});

module.exports = model("SeguimientoPesoYAltura", SeguimientoPesoYAlturaSchema);