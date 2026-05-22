import React from 'react';

function Header() {
  // Nota: Más adelante vincularemos la función para abrir el carrito aquí
  return (
    <header className="topbar">
      <div className="logo">💪 <span>Fuerza Ancestral</span></div>

      <div className="search-bar">
        <input type="text" placeholder="Buscar productos" />
        <button>🔍</button>
      </div>

      <div className="icons">
        <span>🛒</span>
      </div>
    </header>
  );
}

export default Header;