const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken');
const conectarDB = require('./config/db');

require('dotenv').config({ path: 'variables.env' });

conectarDB();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const usuario = jwt.verify(token,process.env.SECRETA);
                return {usuario};
            } catch (error) {
                console.log("Usuario no registrado");
            }
        }
    }
});

server.listen().then( ({url}) => {
	console.log("express server is running on url: " + url);
});