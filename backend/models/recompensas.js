const { Schema, model } = require('mongoose');

const RecompensaSchema = Schema({
    pid: {
        type: Schema.Types.ObjectId,
        ref: 'Perfil'
    },
    nombre: {
        type: String,
        require: true
    },
    puntos: {
        type: Number,
        require: true
    },
    canjeada: {
        type: Boolean,
        default: false
    },
}, { collection: 'recompensas' });

RecompensaSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

module.exports = model('Recompensa', RecompensaSchema);