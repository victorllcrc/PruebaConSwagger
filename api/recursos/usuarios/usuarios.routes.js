const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const bcrypt =require('bcrypt')
const jwt = require ('jsonwebtoken')

const validarUsuario = require('./usuarios.validate').validarUsuario
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin
const log = require('./../../../utils/logger')
const config = require('./../../../config')
const  usuarioController = require('./usuarios.controller')


const usuarios = require('../../../database').usuarios
const usuariosRouter = express.Router()

function transformarBodyALowerCase (req, res, next){
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}


usuariosRouter.get('/', (req, res)=>{
    usuarioController.obtenerUsuarios()
    .then(usuarios=>{
        res.json(usuarios)
    })
    .catch(err => {
        log.error ('Error al obtener todos los usuarios', err)
        res.status(500)
    })
})

usuariosRouter.post('/',[validarUsuario, transformarBodyALowerCase], (req, res)=>{
    let nuevoUsuario = req.body
    usuarioController.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
    .then(usuarioExiste => {
        if(usuarioExiste){
            log.warn(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existe en la base de datos`)
            res.status(409).send('El email o usuario ya estan asociados con una cuenta')
            return
        }
        bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword)=>{
            if(err){
                log.error("Error ocurrio al tratar de obtener el hash de una  contraseña", err)
                res.status(500).send("Error procesando creacion del usuario.")
                return
            }
            usuarioController.crearUsuario(nuevoUsuario,hashedPassword)
            .then(nuevoUsuario=>{
                res.status(201).send("Usuario creado exitosamente")
            })
            .catch(err =>{
                log.error("Error ocurrio al tratar de crear nuevo usuario", err)
                res.status(500).send("Error ocurrio al tratar de crear nuevo usuario.")
            })
        })
    })
    .catch(err => {
        log.error(`Error ocurrio al tratar de verificar si usuario [${nuevoUsuario.username}] con email [${nuevoUsuario.email}] ya existen.`)
        res.status(500).send(`Error ocurrio al tratar de crear nuevo usuario.`)
    })

})

usuariosRouter.post('/login',[validarPedidoDeLogin, transformarBodyALowerCase], async(req, res)=>{
    let usuarioNoAutenticado = req.body
    let usuarioRegistrado

    try{
        usuarioRegistrado = await usuarioController.obtenerUsuarios({
            username: usuarioNoAutenticado.username
        })
    }catch(err){
        log.error(`Error ocurrio al tratar de determiner si el usuario [${usuarioNoAutenticado.username}] ya existe`, err)
        res.status(500).send('Error ocurrio durante el proceso de login.')
        return
    }

    if(!usuarioRegistrado){
        log.info(`Usuario [${usuarioNoAutenticado.username}] no existe. NO pudo  ser autenticado`)
        res.status(400).send('Credenciales incorrectas. Asegurate que el username y  contraseña sean correctas')
        return
    }
    let contraseñaCorrecta
    try {
        contraseñaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password, usuarioRegistrado.password)
    }catch (err){
        log.error(`Error ocurrio al tratar de verificar si la contraseña es  correcta`, err)
        res.status(500).send('Error ocurrio durante el proceso de login')
        return
    }

    if(contraseñaCorrecta){
        let token = jwt.sign({id: usuarioRegistrado.id},config.jwt.secreto,{ expiresIn: config.jwt.tiempoDeExpiracion})
        log.info(`Usuario ${usuarioNoAutenticado.username} completo autentificacion exitosamente`)
        res.status(200).json({token})
    }else{
        log.info(`Usuario ${usuarioNoAutenticado.username} no completo autentificacion , contraseña incorecta `)
        res.status(400).send("credenciales incorectas, asegurate que el username o password sean correctas")
    }
})


module.exports = usuariosRouter