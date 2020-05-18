// constructor
const Producto = function(customer) {
    this.id = customer.id;
    this.nombre = customer.nombre;
    this.existencia = customer.existencia;
    this.precio = customer.precio;
    this.creado = customer.creado;
  };

  
  module.exports = Producto;