import React from 'react';

function Navbar() {
  return (
    <>
      <div className="topbar">
        <div className="logo">¡Tu mejor tienda deportiva!</div>
        <span className="menu-icon">☰</span>
      </div>

      <nav className="navbar" id="navbar">
        <a href="#">Mancuernas</a>
        <a href="#">Pesas</a>
        <a href="#">Accesorios</a>
        <a href="#">Ropa</a>
      </nav>
    </>
  );
}

export default Navbar;