// constructor
const Cliente = function(customer) {
    this.id = customer.id;
    this.nombre = customer.nombre;
    this.apellido = customer.apellido;
    this.empresa = customer.empresa;
    this.email = customer.email;
    this.telefono = customer.telefono;
    //this.creado = customer.creado;
    this.vendedor = customer.vendedor;
  };

  
  module.exports = Cliente;