const mongoose = require("mongoose");

const UsuariosSchema = mongoose.Schema({
    Nombre: {
        type: String,
        required: true,
        unique: true
    },
	Password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Usuario', UsuariosSchema);