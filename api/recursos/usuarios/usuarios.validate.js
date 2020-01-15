const Joi = require('joi')
const log = require('./../../../utils/logger')

const blueprintUsuario = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
})

let validarUsuario = (req , res , next)=>{
    const resultado = Joi.validate (req.body, blueprintUsuario, {abortEarly: false, convert:false})

    if(resultado.error === null){
        next()
    }else{
        
        log.info("Producto falló la validadcion",resultado.error.details.map(error => error.message))
        res.status(400).send(" Un monton de cosas para validar las entradas")
    }
}

const blueprintPedidoDeLogin = Joi.object().keys({
    username:Joi.string().required(),
    password: Joi.string().required()
})


let validarPedidoDeLogin=(req, res, next)=>{
    const resultado = Joi.validate(req.body, blueprintPedidoDeLogin, {abortEarly: false, convert:false})
    if(resultado.error===null){
        next()
    }else{
        res.status(400).send("Login fallo, Debes especificar el username y contraseña del usuario. Ambos deben ser strings.")
    }
}

module.exports = {
    validarPedidoDeLogin,
    validarUsuario
}