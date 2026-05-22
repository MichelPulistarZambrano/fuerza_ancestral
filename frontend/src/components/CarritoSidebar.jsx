import React from 'react';

function CarritoSidebar() {
  return (
    <>
      <div className="carrito-overlay"></div>

      <div className="carrito">
        <div className="carrito-header">
          <div>
            <h2>Carrito de compras</h2>
            <small id="contadorProductos">0 Productos</small>
          </div>
          <button className="cerrar-btn">✖</button>
        </div>

        <div className="carrito-contenido" id="carritoItems">
          {/* Productos dinámicos aquí */}
        </div>

        <div className="carrito-cupon">
          <h4>Cupón de descuento</h4>
          <div className="cupon-input">
            <input type="text" placeholder="Ingresa tu cupón" />
            <button>Aplicar</button>
          </div>
        </div>

        <div className="carrito-resumen">
          <div><span>Subtotal</span><span>$0</span></div>
          <div><span>Envío</span><span>$10.000</span></div>
          <div><span>Impuestos</span><span>$5.000</span></div>
          <hr />
          <div className="total"><span>Total</span><span>$0</span></div>
        </div>

        <div className="carrito-botones">
          <button className="btn-pagar">🔒 Proceder al pago seguro</button>
          <button className="btn-seguir">Seguir comprando</button>
        </div>
      </div>
    </>
  );
}

export default CarritoSidebar;