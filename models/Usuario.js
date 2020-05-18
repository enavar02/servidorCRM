const sql = require("../config/db");

// constructor
const Customer = function(customer) {
  this.id = customer.id;
  this.nombre = customer.nombre;
  this.apellido = customer.apellido;
  this.email = customer.email;
  this.password = customer.password;
};

// Customer.getAll = result => {
//     sql.query("SELECT * FROM proyectos", (err, res) => {
//       if (err) {
//         console.log("error: ", err);
//         result(null, err);
//         return;
//       }
  
//       console.log("proyectos: ", res);
//       result(null, res);
//     });
//   };

  Customer.ConsultarUsuario = result => {
    sql.query("SELECT * FROM usuarios WHERE email = ?",[result], (err, res) => {
      if (!err) {
        if (res != "") {
          //console.log(rows[0].nombre);
          //throw new Error('El usuario ya esta registrado');
          //console.log(res);
        }
      } else {
        console.log(err);
      }
    });
  };

Customer.create = (newCustomer, result) => {
  sql.query("INSERT INTO usuarios SET ?", newCustomer, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created customer: ", { id: res.insertId, ...newCustomer });
    //result(null, { id: res.insertId, ...newCustomer });
  });
};


module.exports = Customer;