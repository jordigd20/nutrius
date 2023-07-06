const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

var ComidasSchema = new mongoose.Schema({
    desayuno: [{
        plato: {
            type: Schema.Types.ObjectId,
            ref: 'Plato'
        }
    }],
    almuerzo: [{
        plato: {
            type: Schema.Types.ObjectId,
            ref: 'Plato'
        }
    }],
    comida: [{
        plato: {
            type: Schema.Types.ObjectId,
            ref: 'Plato'
        }
    }],
    merienda: [{
        plato: {
            type: Schema.Types.ObjectId,
            ref: 'Plato'
        }
    }],
    cena: [{
        plato: {
            type: Schema.Types.ObjectId,
            ref: 'Plato'
        }
    }]
})

var DiasSchema = new mongoose.Schema({
    lunes: ComidasSchema,
    martes: ComidasSchema,
    miercoles: ComidasSchema,
    jueves: ComidasSchema,
    viernes: ComidasSchema,
    sabado: ComidasSchema,
    domingo: ComidasSchema
})

const MenuSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    objetivo: {
        type: Number,
        require: true
    },
    fecharec: {
        type: Array
    },
    menusem: DiasSchema
}, { collection: 'menus' });

MenuSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

MenuSchema.set('toObject', {
    versionKey: false,
    transform: function(doc, ret) {
        delete ret.__v;
    },
});

DiasSchema.set('toObject', {
    versionKey: false,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});

ComidasSchema.set('toObject', {
    versionKey: false,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});

module.exports = model('Menu', MenuSchema);