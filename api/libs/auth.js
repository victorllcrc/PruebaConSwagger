const _ = require('underscore')
const bcrypt = require('bcrypt')
const passportJWT = require('passport-jwt')

const log= require('./../../utils/logger')
const usuarios = require('./../../database').usuarios
const config = require('./../../config')

let jwtOptions = {
    secretOrKey:config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}

module.exports = new passportJWT.Strategy (jwtOptions,(jwtPayload, next)=>{
    let index = _.findIndex(usuarios, usuario => usuario.id === jwtPayload.id)
if(index === -1){
    log.info(`JWT token no es valido. Usuario con id ${jwtPayload.id} no existe`)
    next(null, false)
}else{
    log.info(`Usuario ${usuarios[index].username}suministro un token valido. Autentication completada.`)
    next(null, {
        username: usuarios[index].username,
        id: usuarios[index].id
    })
}

})


