const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

const sql = require('../config/db');
const bcryptjs = require('bcryptjs');
require('dotenv').config({path: 'variables.env'});
const jwt = require('jsonwebtoken');

const crearToken = (usuario,secreta,expiresIn) => {
    console.log(usuario);
    const {id, email, nombre, apellido} = usuario;

    return jwt.sign({id, email, nombre, apellido}, secreta, {expiresIn})
}

//resolver
const resolvers = {
    Query:{
        obtenerUsuario: async (_, {}, ctx) => {
            // const usuarioId = await jwt.verify(token, 'palabraSecreta' );
            return ctx.usuario;
        },
        obtenerProductos: async () =>{
            try {
                const QueryProductos = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM producto ', (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
    
                const productos = await QueryProductos();
                //console.log(productos);
                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, {id}) =>{
            //revisar que el producto exista
            const QueryProducto = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM producto WHERE id = ?', [id],(error, results, fields) => {
                        if(error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            const producto = await QueryProducto();
            if(producto == ""){
                throw new Error('Producto no encontrado');
            }
            console.log(producto);
            return producto[0];
          

        },
        obtenerClientes: async () => {
            try {
                const QueryClientes = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM cliente ', (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
    
                const clientes = await QueryClientes();
                //console.log(productos);
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {
                const QueryCliente = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM cliente WHERE vendedor = ?',[ctx.usuario.id], (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
    
                const clienteVendedor = await QueryCliente();
                //console.log(productos);
                return clienteVendedor;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerCliente: async (_, {id}, ctx) =>{
            //Revisar si el cliente existe
            const QueryCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM cliente WHERE id = ?', [id],(error, results, fields) => {
                        if(error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            const cliente = await QueryCliente();
            if(cliente == ""){
                throw new Error('Cliente no encontrado');
            }

            // Quien lo creo puede verlo
            if(cliente[0].vendedor != ctx.usuario.id){
                throw new Error('No tienes las credenciales');
            }
            return cliente[0];
        },
        obtenerPedidos: async () => {
            try {
                const QueryPedidos = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM pedido ', (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
    
                const pedidos = await QueryPedidos();

                //convertir de Json a Object
               
                for await ( const articulo of pedidos) {
                    articulo.pedido = JSON.parse(articulo.pedido);  
                }
                return pedidos;

            } catch (error) {
                console.log(error)
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) =>{
         
            if (ctx.usuario) {
                try {
                    // const QueryPedidosVendedor = (query) => {
                    //     return new Promise((resolve, reject) => {
                    //         sql.query('SELECT * FROM pedido WHERE vendedor = ?', [ctx.usuario.id], (error, results, fields) => {
                    //             if (error) return reject(error);
                    //             //console.log('Consulta correcta');
                    //             return resolve(results);
                    //         });
                    //     });
                    // }

                    const QueryPedidosVendedor = (query) => {
                        return new Promise((resolve, reject) => {
                            sql.query('SELECT pe.id as idPedido,pe.pedido,pe.total,pe.vendedor,pe.estado, pe.creado,cl.id,cl.nombre,cl.apellido,cl.empresa,cl.email,cl.telefono,cl.vendedor,cl.creado FROM pedido pe INNER JOIN cliente cl ON cl.id = pe.cliente WHERE pe.vendedor = ?', [ctx.usuario.id], (error, results, fields) => {
                                if (error) return reject(error);
                                //console.log('Consulta correcta');
                                return resolve(results);
                            });
                        });
                    }

                    const pedidosVendedor = await QueryPedidosVendedor();

                    let pedidoNew = pedidosVendedor;
                    
                    //darle la estructura al cliente para que sea un objeto aparte
                    let obj = [];
                    for (var i = 0; i < pedidoNew.length; i++) {
                    var vari =  {cliente : {id:pedidoNew[i].id, nombre:pedidoNew[i].nombre, apellido:pedidoNew[i].apellido, 
                                             empresa:pedidoNew[i].empresa, email:pedidoNew[i].email, telefono:pedidoNew[i].telefono,vendedor:pedidoNew[i].vendedor,creado:pedidoNew[i].creado}, 
                                 total:pedidoNew[i].total,
                                 vendedor: pedidoNew[i].vendedor,
                                 creado: pedidoNew[i].creado,
                                 estado: pedidoNew[i].estado,
                                 id: pedidoNew[i].idPedido,
                                 pedido: pedidoNew[i].pedido                               
                                
                                } ;
                                 obj.push(vari);
                     }
                  
                   
                     //console.log(obj);

                    //convertir de Json a Object

                    for await (const articulo of obj) {
                        articulo.pedido = JSON.parse(articulo.pedido);
                    }
                    console.log(obj);
                    return obj;
                } catch (error) {
                    console.log(error);
                }
            } else {
                throw new Error('Credenciales no valido');
            }
                
        },
        obtenerPedido: async (_, {id}, ctx) => {
            //verificar si el pedido existe
            const QueryPedido = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM pedido WHERE id = ?', [id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            const pedido = await QueryPedido();
            if(pedido == ""){
                throw new Error('El pedido no existe');
            }
               //convertir de Json a Object

               for await (const articulo of pedido) {
                articulo.pedido = JSON.parse(articulo.pedido);
            }      
            //solo quien lo creo puede verlo
            if(pedido[0].vendedor != ctx.usuario.id){
                throw new Error('No tiene las credenciales');
            }
           return pedido[0];
           

        },
        obtenerPedidosEstado: async (_, {estado}, ctx) =>{
            const QueryPedidoEstado = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM pedido WHERE estado = ? AND vendedor = ?', [estado, ctx.usuario.id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            const pedido = await QueryPedidoEstado();

             //convertir de Json a Object    
             for await ( const articulo of pedido) {
                articulo.pedido = JSON.parse(articulo.pedido);  
            }
            console.log(pedido);
            //console.log(pedido[0].pedido);
            return pedido;
        },
        mejoresClientes: async () => {
            const QueryMejorCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query(
                        "SELECT  SUM(pe.total) as total ,cl.* FROM pedido as pe  INNER JOIN cliente cl ON cl.id = pe.cliente WHERE pe.estado = 'COMPLETADO' GROUP BY pe.cliente",
                        //"SELECT  SUM(pe.total) as total, cl.* FROM pedido as pe  INNER JOIN cliente cl ON cl.id = pe.cliente WHERE pe.estado = 'COMPLETADO' GROUP BY pe.cliente"
                        (error, results, fields) => {
                            if (error) return reject(error);

                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                });
            }
            let clientes = await QueryMejorCliente();
            
            let arreglo = [];
            for (var i = 0; i < clientes.length; i++) {
            var vari =  {cliente : [{id:clientes[i].id, nombre:clientes[i].nombre, apellido:clientes[i].apellido, 
                                     empresa:clientes[i].empresa, email:clientes[i].email, telefono:clientes[i].telefono,
                                     vendedor:clientes[i].vendedor, creado:clientes[i].creado}], 
                         total:clientes[i].total} ;
              arreglo.push(vari);
             }
          
           
             console.log(arreglo);
             return arreglo;

           //modelo de la estructura
           //[ {cliente : [{id:12}], total:100  } ]

        },
        mejorVendedores: async () => {
            const QueryMejorVendedor = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query(
                        "SELECT  SUM(pe.total) as total ,us.* FROM pedido as pe  INNER JOIN usuarios us ON us.id = pe.vendedor WHERE pe.estado = 'COMPLETADO' GROUP BY pe.vendedor",
                        //"SELECT  SUM(pe.total) as total, cl.* FROM pedido as pe  INNER JOIN cliente cl ON cl.id = pe.cliente WHERE pe.estado = 'COMPLETADO' GROUP BY pe.cliente"
                        (error, results, fields) => {
                            if (error) return reject(error);

                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                });
            }
            let vendedores = await QueryMejorVendedor();

            let arreglo = [];
            // Obtenemos nuestro elemento donde mostrar los jugadores
            for (var i = 0; i < vendedores.length; i++) {
            //   var vari =  {cliente : [{id:clientes[i].id}], total:totales[i].total  } ;
            var vari =  {vendedor : [{id:vendedores[i].id, nombre:vendedores[i].nombre, apellido:vendedores[i].apellido, 
                                     email:vendedores[i].email, creado:vendedores[i].creado}], 
                         total:vendedores[i].total} ;
              arreglo.push(vari);
             }
          
           
             console.log(arreglo);
             return arreglo;

           //modelo de la estructura
           //[ {cliente : [{id:12}], total:100  } ]
        },
        buscarProducto: async (_, {texto}) => {
            const QueryBuscarProducto = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query(
                        "SELECT * FROM producto WHERE nombre LIKE '%"+texto+"%'",
                        //"SELECT  SUM(pe.total) as total, cl.* FROM pedido as pe  INNER JOIN cliente cl ON cl.id = pe.cliente WHERE pe.estado = 'COMPLETADO' GROUP BY pe.cliente"
                        (error, results, fields) => {
                            if (error) return reject(error);

                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                });
            }
            let producto = await QueryBuscarProducto();

            console.log(producto);
            return producto;
        }
        
    },
    Mutation: {
        nuevoUsuario: async (_,{input} ) =>{
            const {email, password} = input;
            
            //Revisar si el usuario ya esta registrado
            const doQuery = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM usuarios WHERE email = ?',[email], (error, results, fields) => {
                        if(error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            const existeUsuario = await doQuery();
            if(existeUsuario != ""){
                throw new Error('El Usuario ya esta registrado');
            }

            // Hashear el password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                
                //Guardar en la BD
                const GuardarBD = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('INSERT INTO usuarios SET ?',input, (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
                const Guarda = await GuardarBD();
                if(Guarda.affectedRows = 1){
                    const usuario = new Usuario({id: Guarda.insertId, ...input});
                    return usuario
                }
               
            } catch (error) {
                console.log(error);
            }

        },
        autenticarUsuario: async (_, {input}) =>{
            const {email, password} = input;

            //Si el usuario existe
            const QueryUsuario = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM usuarios WHERE email = ?',[email], (error, results, fields) => {
                        if(error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            const existeUsuario = await QueryUsuario();
            if(existeUsuario == ""){
                throw new Error('El Usuario no existe');
            }
            
            //Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario[0].password);
            if(!passwordCorrecto){
                throw new Error('El Password es Incorrector');
            }        
            
            //Crear el token
            return{
                token: crearToken(existeUsuario[0], process.env.SECRETA, '24h')
            }
        },
        nuevoProducto: async (_, {input}) => {
            try {
                 //Guardar en la BD
                 const GuardarBD = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('INSERT INTO producto SET ?',input, (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
                const Guarda = await GuardarBD();
                if(Guarda.affectedRows = 1){
                    //Como el campo creado no esta en los datos enviados en el input
                    //se realiza una consulta con el id para enviar la fecha de creado
                    const QueryProductoCreado = (query) => {
                        return new Promise((resolve, reject) => {
                            sql.query('SELECT * FROM producto WHERE id = ?',[Guarda.insertId], (error, results, fields) => {
                                if(error) return reject(error);
                                //console.log('Consulta correcta');
                                return resolve(results);
                            });
                        });
                    }
                    const consultaProducto = await QueryProductoCreado();

                    const producto = new Producto(consultaProducto[0]);
                    return producto
                }


            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, { id, input }) => {
            //revisar que el producto exista
            const QueryProducto = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM producto WHERE id = ?', [id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            let producto = await QueryProducto();
            if (producto == "") {
                throw new Error('Producto no encontrado');
            }

            //Guardar en la BD
            const GuardarProducto = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('UPDATE producto SET nombre = ?, precio = ?, existencia = ? WHERE id = ?',
                        [input.nombre, input.precio, input.existencia, id],
                        (error, results, fields) => {
                            if (error) return reject(error);
                            console.log('Consulta correcta');
                            return resolve(results);
                        });
                });
            }
            
            const actualizar = await GuardarProducto();
            if(actualizar.affectedRows == 1){
                const QueryProductoActualizado = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM producto WHERE id = ?', [id], (error, results, fields) => {
                            if (error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
                const productoActualizado = await QueryProductoActualizado();
                return productoActualizado[0];

            }
            
        },
        eliminarProducto: async(_, {id}) => {
             //revisar que el producto exista
             const QueryProducto = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM producto WHERE id = ?', [id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            let producto = await QueryProducto();
            if (producto == "") {
                throw new Error('Producto no encontrado');
            }

            //Eliminar Producto
            const QueryEliminarProducto = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query("DELETE FROM producto WHERE id = ?", id, (error, results, fields) => {
                        if (error) return reject(error);
                        console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            const eliminarProducto = await QueryEliminarProducto();
            return "Producto Eliminado";

        },
        nuevoCliente: async (_, {input}, ctx) => {
            
            const {email} = input;

            //Verificar si el cliente ya esta registrado
            const QueryCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM cliente WHERE email = ?', [email], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            let clienteEncontrado = await QueryCliente();
            if (clienteEncontrado != "") {
                throw new Error('Cliente ya Registrado');
            }

            //asignar el vendedor
            const clienteDatos = new Cliente(input);
            if(ctx.usuario){
                clienteDatos.vendedor = ctx.usuario.id;
            }else{
                throw new Error('Credenciales no valido');
            }
            
             //guardarlo en la base de datos
            const QueryGuardarCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('INSERT INTO cliente SET ?',clienteDatos, (error, results, fields) => {
                        if(error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            const GuardaCliente = await QueryGuardarCliente();
            if(GuardaCliente.affectedRows = 1){
                //Como el campo creado no esta en los datos enviados en el input
                //se realiza una consulta con el id para enviar la fecha de creado
                const QueryClienteCreado = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM cliente WHERE id = ?',[GuardaCliente.insertId], (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
                const consultaCliente = await QueryClienteCreado();

                //const cliente = new Cliente(consultaCliente[0]);
                return consultaCliente[0];
            }
                
        },
        actualizarCliente: async (_, { id, input }, ctx) => {
            //verificar si existe el cliente
            const QueryCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM cliente WHERE id = ?', [id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            let cliente = await QueryCliente();
            if (cliente == "") {
                throw new Error('Cliente no Registrado');
            }

            //verificar si el vendedor es quien edita
            if (cliente[0].vendedor != ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            //guardar en la bd
            const ActualizarCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('UPDATE cliente SET nombre = ?, apellido = ?, email = ?, empresa = ?, telefono = ? WHERE id = ?',
                        [input.nombre, input.apellido, input.email, input.empresa, input.telefono, id],
                        (error, results, fields) => {
                            if (error) return reject(error);
                            console.log('Consulta correcta');
                            return resolve(results);
                        });
                });
            }

            const actualizar = await ActualizarCliente();
            if (actualizar.affectedRows == 1) {
                const UpdateClienteActualizado = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM cliente WHERE id = ?', [id], (error, results, fields) => {
                            if (error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
                const clienteActualizado = await UpdateClienteActualizado();
                return clienteActualizado[0];
            }
        },
        eliminarCliente: async (_,{id}, ctx) => {
              //verificar si existe el cliente
              const QueryCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM cliente WHERE id = ?', [id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            let cliente = await QueryCliente();
            if (cliente == "") {
                throw new Error('Cliente no Registrado');
            }

            //verificar si el vendedor es quien edita
            if (cliente[0].vendedor != ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            //Eliminar de la BD
            const DeleteCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query("DELETE FROM cliente WHERE id = ?", id, (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            await DeleteCliente();
            return "Cliente Eliminado";
        },
        nuevoPedido: async (_, {input}, ctx) => {
            const {cliente} = input;
            //verificar si cliente existe
            const QueryCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM cliente WHERE id = ?', [cliente], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            let clienteExiste = await QueryCliente();
            if (clienteExiste == "") {
                throw new Error('Cliente no Registrado');
            }

            //verificar si el cliente es del vendedor
            if (clienteExiste[0].vendedor != ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            //Revisar que el stock este disponible
            for await ( const articulo of input.pedido) {
                const { id } = articulo;
                const QueryProducto = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM producto WHERE id = ?', [id], (error, results, fields) => {
                            if (error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }

    
                const producto = await QueryProducto();
                if (producto == "") {
                    throw new Error('El Articulo no existe');
                } else {
                    if (articulo.cantidad > producto[0].existencia) {
                        throw new Error(`El articulo: ${producto[0].nombre} excede la cantidad disponible`);
                    }else{
                        //Restar la cantidad a lo disponible
                        producto[0].existencia = producto[0].existencia - articulo.cantidad;

                        const ActualizarExistencia = (query) => {
                            return new Promise((resolve, reject) => {
                                sql.query('UPDATE producto SET existencia = ? WHERE id = ?',
                                    [producto[0].existencia, producto[0].id],
                                    (error, results, fields) => {
                                        if (error) return reject(error);
                                        //console.log('Consulta correcta');
                                        return resolve(results);
                                    });
                            });
                        }
                        await ActualizarExistencia();
            

                    }
                }

                
            }
            
            // //Crear un nuevo pedido
             const nuevoPedido = new Pedido(input);
            console.log(input);
            console.log(nuevoPedido);
            //asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

            //Convertir de Objet a Json
            nuevoPedido.pedido = JSON.stringify(nuevoPedido.pedido); 
            //console.log(nuevoPedido);

            //guardar en BD
            
            const InsertPedido = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('INSERT INTO pedido SET ?',nuevoPedido, (error, results, fields) => {
                        if(error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            const GuardaPedido = await InsertPedido();
            //console.log(GuardaPedido);
            if(GuardaPedido.affectedRows = 1){
                //Como el campo creado no esta en los datos enviados en el input
                //se realiza una consulta con el id para enviar la fecha de creado
                const QueryPedidoCreado = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('SELECT * FROM pedido WHERE id = ?',[GuardaPedido.insertId], (error, results, fields) => {
                            if(error) return reject(error);
                            //console.log('Consulta correcta');
                            return resolve(results);
                        });
                    });
                }
                const consultaPedido = await QueryPedidoCreado();               
                //Convertir de Json a Object
                consultaPedido[0].pedido = JSON.parse(consultaPedido[0].pedido);

                return consultaPedido[0];
            }
        },
        actualizarPedido: async (_, {id, input}, ctx) =>{
            const {cliente} = input;
            //si el pedido existe
            const QueryPedido = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM pedido WHERE id = ?', [id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            let pedido = await QueryPedido();
            if (pedido == "") {
                throw new Error('El Pedido no existe');
            }

            //si el cliente existe
            const QueryCliente = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM cliente WHERE id = ?', [cliente], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            let clienteExiste = await QueryCliente();
            if (clienteExiste == "") {
                throw new Error('El Cliente no existe');
            }

            //si el cliente y pedido pertenece al vendedor
            if (clienteExiste[0].vendedor != ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }
            console.log(input);
            // if(input.pedido){
            //     console.log('existe pedido');
            // }else{
            //     console.log('no existe pedido');
            // }
            //revisar el stock
            if (input.pedido) {
                for await (const articulo of input.pedido) {
                    const { id } = articulo;
                    const QueryProducto = (query) => {
                        return new Promise((resolve, reject) => {
                            sql.query('SELECT * FROM producto WHERE id = ?', [id], (error, results, fields) => {
                                if (error) return reject(error);
                                //console.log('Consulta correcta');
                                return resolve(results);
                            });
                        });
                    }


                    const producto = await QueryProducto();
                    if (producto == "") {
                        throw new Error('El Articulo no existe');
                    } else {
                        if (articulo.cantidad > producto[0].existencia) {
                            throw new Error(`El articulo: ${producto[0].nombre} excede la cantidad disponible`);
                        } else {
                            //Restar la cantidad a lo disponible
                            producto[0].existencia = producto[0].existencia - articulo.cantidad;

                            const ActualizarExistencia = (query) => {
                                return new Promise((resolve, reject) => {
                                    sql.query('UPDATE producto SET existencia = ? WHERE id = ?',
                                        [producto[0].existencia, producto[0].id],
                                        (error, results, fields) => {
                                            if (error) return reject(error);
                                            //console.log('Consulta correcta');
                                            return resolve(results);
                                        });
                                });
                            }
                            await ActualizarExistencia();

                        }
                    }


                }
                //Convertir de Objet a Json
                input.pedido = JSON.stringify(input.pedido);
                console.log(input);
                //guardar el pedido
                const ActualizarPedido = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('UPDATE pedido SET pedido = ?, total = ?, cliente = ?, estado = ? WHERE id = ?',
                            [input.pedido, input.total, input.cliente, input.estado, id],
                            (error, results, fields) => {
                                if (error) return reject(error);
                                //console.log('Consulta correcta');
                                return resolve(results);
                            });
                    });
                }

                const actualizar = await ActualizarPedido();
                if (actualizar.affectedRows == 1) {
                    const UpdatePedido = (query) => {
                        return new Promise((resolve, reject) => {
                            sql.query('SELECT * FROM pedido WHERE id = ?', [id], (error, results, fields) => {
                                if (error) return reject(error);
                                //console.log('Consulta correcta');
                                return resolve(results);
                            });
                        });
                    }
                    const pedidoActualizado = await UpdatePedido();
                    //Convertir de Json a Object
                    pedidoActualizado[0].pedido = JSON.parse(pedidoActualizado[0].pedido);
                    return pedidoActualizado[0];
                }



            } else {
            
                //guardar el pedido
                const ActualizarPedido = (query) => {
                    return new Promise((resolve, reject) => {
                        sql.query('UPDATE pedido SET cliente = ?, estado = ? WHERE id = ?',
                            [input.cliente, input.estado, id],
                            (error, results, fields) => {
                                if (error) return reject(error);
                                //console.log('Consulta correcta');
                                return resolve(results);
                            });
                    });
                }

                const actualizar = await ActualizarPedido();
                if (actualizar.affectedRows == 1) {
                    const UpdatePedido = (query) => {
                        return new Promise((resolve, reject) => {
                            sql.query('SELECT * FROM pedido WHERE id = ?', [id], (error, results, fields) => {
                                if (error) return reject(error);
                                //console.log('Consulta correcta');
                                return resolve(results);
                            });
                        });
                    }
                    const pedidoActualizado = await UpdatePedido();
                    //Convertir de Json a Object
                    pedidoActualizado[0].pedido = JSON.parse(pedidoActualizado[0].pedido);
                    return pedidoActualizado[0];
                }
            }   
        },
        eliminarPedido: async (_, {id}, ctx)=>{
            //Revisar que el usuario exista
            const QueryPedido = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query('SELECT * FROM pedido WHERE id = ?', [id], (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }

            let pedidoExiste = await QueryPedido();
            if (pedidoExiste == "") {
                throw new Error('El Pedido no existe');
            }

            //validar que el pedido corresponda al vendedor que dio de alta
            if (pedidoExiste[0].vendedor != ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            //Eliminar el pedido de la BD
            const DeletePedido = (query) => {
                return new Promise((resolve, reject) => {
                    sql.query("DELETE FROM pedido WHERE id = ?", id, (error, results, fields) => {
                        if (error) return reject(error);
                        //console.log('Consulta correcta');
                        return resolve(results);
                    });
                });
            }
            await DeletePedido();
            return "Pedido Eliminado Correctamente";

        }
    }
}

module.exports = resolvers;