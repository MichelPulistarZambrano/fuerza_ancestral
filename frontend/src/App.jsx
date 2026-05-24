import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Tus componentes base
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CarritoCategoriasSection from './components/CarritoCategoriasSection';
import Ofertas from './components/Ofertas';
import CarritoBeneficiosSection from './components/Beneficios';
import Footer from './components/Footer';

// Las páginas del sistema
import Login from './components/Login';
import Registro from './components/Registro'; 
import CategoriaProductos from './components/CategoriaProductos';
import BuscarProductos from './components/BuscarProductos'; // 🔥 NUEVO
import AdminPedidos from './components/AdminPedidos';
import AdminStock from './components/AdminStock';
import CarritoSidebar from './components/CarritoSidebar'; 


import './App.css';

function ContenidoApp() {
  const [carrito, setCarrito] = useState([]); 
  const [carritoActivo, setCarritoActivo] = useState(false); 
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  const navigate = useNavigate(); 

  function abrirCarrito() {
    setCarritoActivo(true);
  }

  function cerrarCarrito() {
    setCarritoActivo(false);
  }

  const alAgregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(item => item.id_producto === producto.id_producto);
      if (existe) {
        return carritoActual.map(item =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...carritoActual, { ...producto, cantidad: 1 }];
    });
    setCarritoActivo(true); 
  };

  return (
    <div>
      {/* ================= HEADER GLOBAL ================= */}
      <header className="topbar">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo">💪 <span>Fuerza Ancestral</span></div>
        </Link>

        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/buscar?query=${terminoBusqueda}`)}
          />
          <button onClick={() => navigate(`/buscar?query=${terminoBusqueda}`)}>🔍</button>
          
          <Link to="/login">
            <button style={{
              background: '#8b1e2d',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'Montserrat, sans-serif',
              marginLeft: '10px'
            }}>
              👤 Iniciar Sesión
            </button>
          </Link>
        </div>

        <div className="icons">
          <span onClick={abrirCarrito} style={{ cursor: 'pointer', position: 'relative' }}>
            🛒 
            {carrito.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: '#8b1e2d',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
              </span>
            )}
          </span>
        </div>
      </header>

      <Navbar />

      {/* ================= CONTENEDOR DINÁMICO DE PÁGINAS ================= */}
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <CarritoCategoriasSection />
            <Ofertas />
            <CarritoBeneficiosSection />
          </>
        } />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} /> 

        {/* Ruta dinámica para las categorías */}
        <Route 
          path="/categoria/:id_categoria" 
          element={<CategoriaProductos alAgregarAlCarrito={alAgregarAlCarrito} />} 
        />

        {/* 🔥 NUEVA RUTA: Renderiza los resultados de búsqueda */}
        <Route 
          path="/buscar" 
          element={<BuscarProductos alAgregarAlCarrito={alAgregarAlCarrito} />} 
        />

        <Route path="/admin/pedidos" element={<AdminPedidos />} />
        <Route path="/admin/stock" element={<AdminStock />} />
      </Routes>

      <Footer />

      <CarritoSidebar 
        activo={carritoActivo} 
        cerrar={cerrarCarrito} 
        itemsCarrito={carrito}
        setCarrito={setCarrito}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ContenidoApp />
    </Router>
  );
}