const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const PremiumSchema = Schema({
    usuario_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    subscripcion_id: {
        type: String
    },
    plan: {
        type: String,
        required: true
    },
    metodo_pago: {
        type: Number,
        required: true,
        default: 0
    },
    fecha_inicio: {
        type: Date
    },
    duracion: {
        type: Number, //duracion en días
        default: 0
    },
    precio: {
        type: Number,
        default: 0
    },
    activo: {
        type: Boolean,
        required: true,
        default: true
    }
}, { collection: 'premium' });

PremiumSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model('Premium', PremiumSchema);