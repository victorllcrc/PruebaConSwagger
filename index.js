const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const passport = require('passport')
const mongoose = require('mongoose')

const productosRouter= require('./api/recursos/productos/productos.routes')
const usuariosRouter= require('./api/recursos/usuarios/usuarios.routes')
const logger = require('./utils/logger')
const authJWT = require('./api/libs/auth')
const config = require('./config')

passport.use(authJWT)

mongoose.connect('mongodb://127.0.0.1:27017/vendetuscorotos',{useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connection.on('error', ()=>{
    logger.error ('Fallo la conexcion a mongodb')
    process.exit(1)
})

const app = express()
app.use(bodyParser.json())
app.use(morgan('short',{
    stream:{
        write: message => logger.info(message.trim())
    }
}))




app.use(passport.initialize())
app.use('/productos', productosRouter)
app.use('/usuarios', usuariosRouter)



app.listen(config.puerto , () => {
    logger.info('Escuchando en el puerto 3000.')
})