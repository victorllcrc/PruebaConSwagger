const Producto = require('./productos.model')

function crearProducto(producto, dueño){
    return new Producto({
        ...producto,
        dueño
    }).save()
}

function obtenrProductos(){
    return Producto.find({})
}

function obtenerProducto(id){
    return Producto.findById(id)
}

function borrarProducto(id){
    return Producto.findByIdAndRemove(id)
}

function reemplazarProducto(id, producto, username){
    return Producto.findOneAndUpdate({_id:id},{
        ...producto,
        dueño: username
    },{
        new:true // nos devuelve el objeto ya modificado
    })
}

module.exports = {
    crearProducto,
    obtenrProductos,
    obtenerProducto,
    borrarProducto,
    reemplazarProducto
}