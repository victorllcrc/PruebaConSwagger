const Usuario = require ('./ususarios.model')

function obtenerUsuarios(){
    return Usuario.find({})
}

function crearUsuario(usuario, hasshedPassword){
    return new Usuario({
        ...usuario,
        password: hasshedPassword
    }).save()
}

function usuarioExiste(username, email){
    return new Promise((resolve, reject)=>{
        Usuario.find().or([{'userneme': username},{'email': email}])
            .then(usuarios =>{
                resolve(usuarios.length > 0)
            })
            .catch(err=>{
                reject(err)
            })
    })
    
}

function obtenerUsuarios ({
    username: username,
    id: id
}){
    if(username) return Usuario.findOne({username: username})
    if(id) return Usuario.findOne(id)
    throw new Error ("Funcion obtener usuario del controller fue llamada sin especificar username o id")
}

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    usuarioExiste,
    obtenerUsuarios
}