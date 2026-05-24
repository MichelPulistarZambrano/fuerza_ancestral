import React from 'react';
import { Link } from 'react-router-dom';

function CarritoCategoriasSection() {
  const categorias = [
    { id: 1, icon: '🏋️', titulo: 'Mancuernas y Pesas' },
    { id: 4, icon: '👟', titulo: 'Calzado Deportivo' },
    { id: 2, icon: '👕', titulo: 'Ropa Deportiva' },
    { id: 3, icon: '🕶', titulo: 'Accesorios' },
  ];

  return (
    <section className="categorias-section">
      <h2 className="categorias-titulo">CATEGORÍAS DESTACADAS</h2>

      <div className="categorias">
        {categorias.map(function(categoria) {
          return (
            // Convertimos la tarjeta en un enlace dinámico hacia la ruta del componente anterior
            <Link 
              to={`/categoria/${categoria.id}`} 
              key={categoria.id} 
              className="categoria-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="categoria-icon">{categoria.icon}</div>
              <h3>{categoria.titulo}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CarritoCategoriasSection;