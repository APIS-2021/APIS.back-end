const mongoose = require('mongoose');

require('dotenv').config({ path: 'variables.env' });

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("DB conectada");
    } catch (error) {
        console.log("Error con base de datos");
        console.log(error);
        process.exit(4);
    }
}

module.exports = conectarDB;