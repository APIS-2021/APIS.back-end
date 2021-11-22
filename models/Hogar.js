const mongoose = require("mongoose");

const HogaresSchema = mongoose.Schema({
    Nombre: {
        type: String,
        required: true
    },
    id2: {
        type: String,
        required: false
    },
	Creador: {
        type: String,
        required: true
    },
    Habitantes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            require: true
        }
    ]
});

module.exports = mongoose.model('Hogar', HogaresSchema);