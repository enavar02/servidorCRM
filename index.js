const {ApolloServer} =  require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers =require('./db/resolvers');
const mysqlConnection = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});




mysqlConnection.query('SELECT * FROM usuarios',(err, rows, fields)=>{
    if(!err){
        console.log("base de datos conectada");
    }else{
        console.log(err);
    }
});

//servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        //console.log(req.headers['authorization']);
        //console.log(req.headers);
        const token = req.headers['authorization'] || '';
        if(token){
            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA );
                //console.log(usuario);
                return {
                    usuario
                }
                
            } catch (error) {
                console.log('Hubo un Error');
                console.log(error);
            }
        }
    },
    cors: {
        credentials: true,
        origin: (origin, callback) => {
            const whitelist = [
                "https://cliente-liart.now.sh",
                'http://localhost:3000'
            ];

            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error("Not allowed by CORS"))
            }
        }
    }
});



//arrancar servidor
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 4000;
server.listen(port, host, () => {
    //console.log('El servidor esta funcionando');
}).then( ({url}) =>{
   console.log(`Servidor Corriendo en la url ${url}`)
});
// server.listen({port: process.env.PORT || 4000}).then( ({url}) =>{
//     console.log(`Servidor Corriendo en la url ${url}`)
// })