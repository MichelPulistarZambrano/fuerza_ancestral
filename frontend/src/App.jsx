import React, { useState } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CarritoCategoriasSection from './components/CarritoCategoriasSection';
import Ofertas from './components/Ofertas';
import CarritoBeneficiosSection from './components/Beneficios';
import Footer from './components/Footer';

function App() {
  // Estado para controlar si el carrito está abierto o no
  const [carritoActivo, setCarritoActivo] = useState(false);

  function abrirCarrito() {
    setCarritoActivo(true);
  }

  function cerrarCarrito() {
    setCarritoActivo(false);
  }

  return (
    <div>
      {/* Pasamos la función abrirCarrito al Header mediante Props */}
      <header className="topbar">
        <div className="logo">💪 <span>Fuerza Ancestral</span></div>
        <div className="search-bar">
          <input type="text" placeholder="Buscar productos" />
          <button>🔍</button>
        </div>
        <div className="icons">
          <span onClick={abrirCarrito} style={{ cursor: 'pointer' }}>🛒</span>
        </div>
      </header>

      <Navbar />
      <Hero />
      <CarritoCategoriasSection />
      <Ofertas />
      <CarritoBeneficiosSection />
      <Footer />

      {/* ================= CARRITO CON CONTROL DE ESTADO DE REACT ================= */}
      <div 
        className={`carrito-overlay ${carritoActivo ? 'activo' : ''}`} 
        onClick={cerrarCarrito}
      ></div>

      <div className={`carrito ${carritoActivo ? 'activo' : ''}`}>
        <div className="carrito-header">
          <div>
            <h2>Carrito de compras</h2>
            <small id="contadorProductos">0 Productos</small>
          </div>
          <button className="cerrar-btn" onClick={cerrarCarrito}>✖</button>
        </div>

        <div className="carrito-contenido" id="carritoItems">
          {/* Aquí irán tus productos */}
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
          <button className="btn-seguir" onClick={cerrarCarrito}>Seguir comprando</button>
        </div>
      </div>
    </div>
  );
}

export default App;