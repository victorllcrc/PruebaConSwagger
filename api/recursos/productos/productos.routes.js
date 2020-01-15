const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const passport = require('passport')

const validarProducto = require('./productos.validate')
const log = require('./../../../utils/logger')
const productos = require('../../../database').productos
const productoController = require('./productos.controller')

const jwtAuthenticate = passport.authenticate('jwt',{ session:false })
const productosRouter = express.Router()


function validarId(req, res, next){
    let id = req.params.id

    if(id.match(/^[a-fA-F0-9]{24}$/) === null){
        res.status(400).send(`El id [${id}] suministado en el URL no es valido`)
        return
    }
    next()
}


productosRouter.get('/', (req, res) => {
    productoController.obtenrProductos()
    .then(productos => res.json(productos))
    .catch(err => {
        res.status(500).send("error al  leer los productos de la base de datos")

    })
   
})

productosRouter.post('/', [jwtAuthenticate, validarProducto],(req, res) => {

    productoController.crearProducto(req.body,req.user.username)
    .then(producto=>{
        log.info('Productos agregado a la coleccion productos', producto)
        res.status(201).json(producto)
    })
    .catch(err =>{
        log.error("Producto no pudo ser creado", err)
        res.status(500).send("Error ocurrio al tratar de crear el producto.")
    })
    
    
})

productosRouter.get('/:id',validarId, (req, res) => {
    let id = req.params.id
    productoController.obtenerProducto(id)
    .then(producto=>{
        if(!producto){
            res.status(404).send(`Producto con id [${id}] no existe.`)
        }else{
            res.json(producto)
        }
    })
    .catch(err=>{
        log.error(`Excepcion ocurrio al tratar de obtener producto con id[${id}]`, err)
        res.status(500).send(`Error ocurrio obteniendo producto con id [${id}]`)
    })
})
productosRouter.put('/:id',[jwtAuthenticate, validarProducto], async(req, res) => {
    let id = req.params.id
    let requestUsuario = req.user.username
    let productoAReemplazar

    try{
        productoAReemplazar = await productoController.obtenerProducto(id)
    }catch (err){
        log.warn(`Exception ocurrio al procesar la modificacion del producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrio modificando producto con id [${id}]`)
        return
    }
    
    if(!productoAReemplazar){
        res.status(404).send(`El producto con id [${id}] no exisye`)
        return
    }
    
    if(productoAReemplazar.dueño !== requestUsuario){
        log.warn(`Usuario [${requestUsuario}] no es dueño de producto con id [${id}]. Dueno real es
        [${productoAReemplazar.dueño}]. Request no sera procesado`)
        res.status(401).send(`No eres dueño del producto con id [${id}]. Solo puedes modificar productos creado por ti`)
        return
    }

    productoController.reemplazarProducto(id, req.body, requestUsuario)
    .then(producto=>{
        res.json(producto)
        log.info(`Producto con id [${id}] reemplazado con nuevo producto`, producto)

    })
    .catch(err =>{
        log.error(`Excepcion al tratar ade reemplazar producto con id [${id}]`, err)
        res.status(500).send(`Error ocurrio reemplazando producto con id [${id}]`)
    })
    
    
    
    
})
productosRouter.delete('/:id',[jwtAuthenticate, validarId], async(req, res) => {
    let id = req.params.id
    let productoABorrar

    try{
        productoABorrar = await productoController.obtenerProducto(id)

    }catch (err){
        log.warn(`Excepcion ocurrio al procesar el borrado de producto con id [${id}]`, err)
        res.status(404).send(`Error ocurrio borrando producto con id [${id}]`)
    }
    
    if (!productoABorrar) {
        log.info(`Producto con id [${id}] no existe, Nada que borrar`)
        res.status(404).send(`Producto con id [${id} no existe. Nada que borrar.]`)
        return
    }
    
    let usuarioAutenticado = req.user.username
    if(productoABorrar.dueño !== usuarioAutenticado){
        log.info(`Usuaraio [${usuarioAutenticado}] no es duño de producto con id [${id}].
        Dueno real es [${productoABorrar.dueño}]. Request no sera procesado`)
        res.status(401).send (`No eres dueño del producto con id ${id} Solo puedes borrar productos creados por ti.`)
        return
    }

    try{
        let productoBorrado = await productoController.borrarProducto(id)
        log.info(`Producto con id [${id }] fue borrado`)
        res.json(productoBorrado)
    }catch(err){
        res.status(500).send(`Error ocurrio borrando producto con id [${id}]`)
    }
})


module.exports = productosRouter