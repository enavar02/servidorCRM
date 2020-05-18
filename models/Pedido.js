// constructor
const Pedido = function(customer) {
    //this.id = customer.id;
    this.pedido = customer.pedido;
    this.total = customer.total;
    this.cliente = customer.cliente;
    // this.vendedor = customer.vendedor;
    // this.estado = customer.estado;
  };

  
  module.exports = Pedido;