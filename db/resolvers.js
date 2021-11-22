const Usuario = require('../models/Usuario');
const Hogar = require('../models/Hogar');
const Producto = require('../models/Producto');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config({ path: 'variables.env' });

const resolvers = {
	Query: {
        obtenerUsuario: async (_, {input}) => {
            return resultado = usuarios.filter( usuario => usuario.Nombre === input.Nombre);
        }
	},
    Mutation: {
        nuevoUsuario: async (_, {input}) => {
            const { Nombre, Password } = input;

            // checar que el usuario no exista
            const checarUsuario = await Usuario.findOne({Nombre});
            if (checarUsuario) {
                throw new Error('El usuario ya existe');
            }

            // hash password
            const salt = await bcryptjs.genSalt(10);
            const newPassword = await bcryptjs.hash(Password,salt);

            // guardar usuario
            try {
                const nuevoUsuario = {
                    Nombre,
                    Password: newPassword
                }
                const usuario = new Usuario(nuevoUsuario);
                usuario.save();
                return usuario;
            } catch (error) {
                console.log(error);
            }
        },
        verificarUsuario: async (_, {input}) => {
            const { Nombre, Password } = input;

            // checar que el usuario exista
            const checarUsuario = await Usuario.findOne({Nombre});
            if (!checarUsuario) {
                throw new Error('El usuario no existe');
            }

            // revisar el password
            const checkpass = await bcryptjs.compare(Password,checarUsuario.Password);
            if (!checkpass) {
                throw new Error('Contraseña incorrecta');
            }

            // regresar token
            return {
                Token: jwt.sign({id: checarUsuario.id}, process.env.SECRETA, {expiresIn:'24h'})
            };
        },
        nuevoHogar: async (_, {input}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Asignar creador
            input.Creador = ctx.usuario.id;
            
            // Crear hogar
            const hogar = new Hogar(input);
            hogar.save();
            return hogar;
        },
        agregarHogarUsuario: async (_, {id, input}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Validar usuario
            const usuario = await Usuario.findById(ObjectId(input.id));
            if (!usuario) {
                throw new Error('Usuario invalido');
            }
            // Buscar hogar
            var hogar = await Hogar.findById(ObjectId(id));
            if (!hogar) {
                throw new Error('Hogar invalido');
            }
            if (hogar.Creador != ctx.usuario.id) {
                throw new Error('Permisos invalidos');
            }
            if (hogar.Creador == input.id) {
                throw new Error('No se puede agregar al creador como habitante');
            }
            if (hogar.Habitantes.includes(input.id)){
                throw new Error('Usuario ya agregado');
            }
            // actualizar hogar
            await Hogar.findOneAndUpdate({_id:ObjectId(id)},{$push: {Habitantes: ObjectId(input.id)}})
            hogar = await Hogar.findById(ObjectId(id));
            return hogar;
        },
        eliminarHogarUsuario: async (_, {id, input}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Buscar hogar
            var hogar = await Hogar.findById(ObjectId(id));
            if (!hogar) {
                throw new Error('Hogar invalido');
            }
            if (hogar.Creador != ctx.usuario.id) {
                throw new Error('Permisos invalidos');
            }
            if (!hogar.Habitantes.includes(input.id)){
                throw new Error('Usuario no esta agregado');
            }
            // actualizar hogar
            await Hogar.findOneAndUpdate({_id:ObjectId(id)},{$pull: {Habitantes: ObjectId(input.id)}})
            hogar = await Hogar.findById(ObjectId(id));
            return hogar;
        },
        editarHogar: async (_, {id, input}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Buscar hogar
            var hogar = await Hogar.findById(ObjectId(id));
            if (!hogar) {
                throw new Error('Hogar invalido');
            }
            if (hogar.Creador != ctx.usuario.id) {
                throw new Error('Permisos invalidos');
            }
            // actualizar hogar
            await Hogar.findOneAndUpdate({_id:ObjectId(id)},input);
            hogar = await Hogar.findById(ObjectId(id));
            return hogar;
        },
        eliminarHogar: async (_, {id}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Buscar hogar
            var hogar = await Hogar.findById(ObjectId(id));
            if (!hogar) {
                throw new Error('Hogar invalido');
            }
            if (hogar.Creador != ctx.usuario.id) {
                throw new Error('Permisos invalidos');
            }
            await Hogar.findOneAndDelete({_id:ObjectId(id)});
            // Eliminar productos relacionados
            await Producto.deleteMany({DeHogar:ObjectId(id)})
            return "Hogar eliminado";
        },
        nuevoProducto: async (_, {input}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Comprobar que hogar exista
            const hogar = await Hogar.findById(ObjectId(input.DeHogar));
            if (!hogar) {
                throw new Error('Hogar invalido');
            }
            // Crear Producto
            const producto = new Producto(input);
            producto.save();
            return producto;
        },
        editarProducto: async (_, {id, input}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Buscar producto
            var producto = await Producto.findById(ObjectId(id));
            // Buscar hogar
            const hogar = await Hogar.findById(ObjectId(input.DeHogar));
            if (!hogar) {
                throw new Error('Hogar invalido');
            }
            if (hogar.Creador != ctx.usuario.id){
                if (!hogar.Habitantes.includes(ctx.usuario.id)) {
                    throw new Error('Permisos invalidos');
                }
            }
            // Checar si se cambia el asignado
            if (input.Asignado) {
                // Checar que el usuario de asignado tenga acceso al hogar
                if (hogar.Creador != input.Asignado){
                    if (!hogar.Habitantes.includes(input.Asignado)) {
                        throw new Error('Permisos de persona asignada invalidos');
                    }
                }
            }
            // Checar que los numeros sean positivos
            if (input.Precio) {
                if (input.Precio < 0) {
                    throw new Error('Precio invalido');
                }
            }
            if (input.Cantidad) {
                if (input.Precio <= 0) {
                    throw new Error('Cantidad invalida');
                }
            }
            // actualizar producto
            await Producto.findOneAndUpdate({_id:ObjectId(id)},input);
            producto = await Producto.findById(ObjectId(id));
            return producto;
        },
        eliminarProducto: async (_, {id}, ctx) => {
            // Checar permisos de usuario
            if (!ctx.usuario) {
                throw new Error('Falta token');
            }
            // Buscar hogar
            const hogar = await Hogar.findById(ObjectId(id));
            if (!hogar) {
                throw new Error('Hogar invalido');
            }
            if (hogar.Creador != ctx.usuario.id){
                if (!hogar.Habitantes.includes(ctx.usuario.id)) {
                    throw new Error('Permisos invalidos');
                }
            }
            // Eliminar producto
            await Producto.findOneAndDelete({_id:ObjectId(id)});
            return "Producto eliminado";
        }
    }
};

module.exports = resolvers;