const { Schema, model } = require('mongoose');

const PlatoSchema = Schema({
    nombre: {
        type: String,
        required: true
    },
    comida: { //recuperar de un JSON los tipos de comida
        type: Array,
        required: true
    },
    intolerancias: { //recuperar de un JSON los tipos de intolerancias
        type: Array
    },
    imagen: {
        type: String
    },
    usuario_id: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        default: null
    }
}, { collection: 'platos' });

PlatoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model('Plato', PlatoSchema);