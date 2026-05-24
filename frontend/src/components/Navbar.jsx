import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar" id="navbar">
      {/* Apunta a las IDs reales de tu base de datos (Ej: 1=Pesas/Mancuernas, 2=Ropa) */}
      <Link to="/categoria/1">Mancuernas & Pesas</Link>
      <Link to="/categoria/2">Ropa Deportiva</Link>
      <Link to="/categoria/3">Accesorios</Link>
      <Link to="/categoria/4">Calzado</Link>
    </nav>
  );
}