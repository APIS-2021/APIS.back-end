const mongoose = require("mongoose");

const ProductosSchema = mongoose.Schema({
    Nombre: {
        type: String,
        required: true
    },
	Precio: {
        type: Number,
        required: true
    },
    Cantidad: {
        type: Number,
        required: true
    },
    Asignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    DeHogar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hogar',
        required: true
    },
    Status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Producto', ProductosSchema);