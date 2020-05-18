const mysql = require('mysql');
require('dotenv').config({path: 'variables.env'});

const mysqlConnection = mysql.createConnection({
    host: process.env.BD_HOST,
    user: process.env.BD_USER,
    password: process.env.BD_PASS,
    database: process.env.BD_NOMBRE,
    port: process.env.BD_PORT,
    multipleStatements: true 
    
});

mysqlConnection.connect(function (err){
    if(err){
        console.log(err);
    }else{
        console.log('Base de datos Conectada');
    }
});

module.exports = mysqlConnection;