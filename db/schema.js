const { gql } = require('apollo-server');

const typeDefs = gql`
    # Type return
	type Usuario {
        id: ID
		Nombre: String
	}

    type Hogar {
        id: ID
        Creador: ID
        Nombre: String
        Habitantes: [ID]
    }
    
    type Producto {
        id: ID
        Nombre: String
        Precio: Float
        Cantidad: Int
        Asignado: ID
        DeHogar: ID
        Status: Boolean
    }

    # Input generico

    input idInput {
        id: ID!
    }


    # Query

    input UsuarioInput {
        Nombre: String!
    }

	type Query {
        # Usuario
        obtenerUsuario(input: UsuarioInput!) : [Usuario]
        # Hogar
        obtenerHogares: [Hogar]
        # Producto
        obtenerProductosHogar(input: idInput!) : [Producto]
	}

    # Mutation

    type Token {
        Token: String
    }

    input UsuarioCompletoInput {
        Nombre: String!
        Password: String!
    }

    input HogarCompletoInput {
        Nombre: String!
    }

    input ProductoCompletoInput {
        Nombre: String!
        Precio: Float!
        Cantidad: Int!
        DeHogar: ID!
    }

    input ProductoEditarInput {
        Nombre: String
        Precio: Float
        Cantidad: Int
        Asignado: ID
        Status: Boolean
    }

    type Mutation {
        # Usuarios
        nuevoUsuario(input: UsuarioCompletoInput!): Usuario
        verificarUsuario(input: UsuarioCompletoInput!): Token
        # Hogar
        nuevoHogar(input: HogarCompletoInput!): Hogar
        agregarHogarUsuario(id: idInput!, input: idInput!): Hogar
        eliminarHogarUsuario(id: idInput!, input: idInput!): Hogar
        editarHogar(id: idInput!, input: HogarCompletoInput!): Hogar
        eliminarHogar(id: idInput!): String
        # Producto
        nuevoProducto(input: ProductoCompletoInput!): Producto
        editarProducto(id: idInput!, input: ProductoEditarInput!): Producto
        eliminarProducto(id: idInput!): String
    }
`;

module.exports = typeDefs;