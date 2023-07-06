const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

var ComidasSchema = new mongoose.Schema({
    desayuno: {
        puntos: {
            type: Number,
            default: 15
        },
        completada: {
            type: Boolean,
            default: false
        },
        platos: [{
            plato: {
                type: Schema.Types.ObjectId,
                ref: 'PlatoPerfil'
            },
            completado: {
                type: Boolean,
                default: false
            },
            fallado: {
                type: Boolean,
                default: false
            }
        }]
    },
    almuerzo: {
        puntos: {
            type: Number,
            default: 15
        },
        completada: {
            type: Boolean,
            default: false
        },
        platos: [{
            plato: {
                type: Schema.Types.ObjectId,
                ref: 'PlatoPerfil'
            },
            completado: {
                type: Boolean,
                default: false
            },
            fallado: {
                type: Boolean,
                default: false
            }
        }]
    },
    comida: {
        puntos: {
            type: Number,
            default: 30
        },
        completada: {
            type: Boolean,
            default: false
        },
        platos: [{
            plato: {
                type: Schema.Types.ObjectId,
                ref: 'PlatoPerfil'
            },
            completado: {
                type: Boolean,
                default: false
            },
            fallado: {
                type: Boolean,
                default: false
            }
        }]
    },
    merienda: {
        puntos: {
            type: Number,
            default: 10
        },
        completada: {
            type: Boolean,
            default: false
        },

        platos: [{
            plato: {
                type: Schema.Types.ObjectId,
                ref: 'PlatoPerfil'
            },
            completado: {
                type: Boolean,
                default: false
            },
            fallado: {
                type: Boolean,
                default: false
            }
        }]
    },
    cena: {
        puntos: {
            type: Number,
            default: 30
        },
        completada: {
            type: Boolean,
            default: false
        },
        platos: [{
            plato: {
                type: Schema.Types.ObjectId,
                ref: 'PlatoPerfil'
            },
            completado: {
                type: Boolean,
                default: false
            },
            fallado: {
                type: Boolean,
                default: false
            }

        }]
    }
})

var DiasSchema = new mongoose.Schema({
    lunes: {
        fecha: {
            type: Date
        },
        comidas: ComidasSchema
    },
    martes: {
        fecha: {
            type: Date
        },
        comidas: ComidasSchema
    },
    miercoles: {
        fecha: {
            type: Date
        },
        comidas: ComidasSchema
    },
    jueves: {
        fecha: {
            type: Date
        },
        comidas: ComidasSchema
    },
    viernes: {
        fecha: {
            type: Date
        },
        comidas: ComidasSchema
    },
    sabado: {
        fecha: {
            type: Date
        },
        comidas: ComidasSchema
    },
    domingo: {
        fecha: {
            type: Date
        },
        comidas: ComidasSchema
    }
})

var IslasSchema = new mongoose.Schema({
    meses: [String],
    isla: {
        type: Schema.Types.ObjectId,
        ref: 'Islas'
    },
    objetos: [{
        id: {
            type: String
        },
        desbloqueado: {
            type: Boolean,
            default: false
        },
        dia: {
            type: String
        }
    }]
});

const MenuPerfilSchema = Schema({
    menu_id: {
        type: Schema.Types.ObjectId,
        ref: 'Menu'
    },
    perfil_id: {
        type: Schema.Types.ObjectId,
        ref: 'Perfil'
    },
    semana: {
        type: Number,
        require: true
    },
    comidas_falladas: {
        type: Number,
        default: 0
    },
    comidas_completadas: {
        type: Number,
        default: 0
    },
    platos_marcados: {
        type: Number,
        default: 0
    },
    eficacia: {
        type: Number,
        default: 0
    },
    isla: IslasSchema,
    puntos_obtenidos: {
        type: Number,
        default: 0
    },
    menusem: DiasSchema
}, { collection: 'menuperfil' });

MenuPerfilSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
});

MenuPerfilSchema.set('toObject', {
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

module.exports = model('MenuPerfil', MenuPerfilSchema);