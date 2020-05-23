const mysql = require('mysql');
require('dotenv').config({path: 'variables.env'});

function handleDisconnect() {

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
mysqlConnection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
  module.exports = mysqlConnection;
}

handleDisconnect();



