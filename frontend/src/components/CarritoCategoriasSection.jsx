import React from 'react';

function CarritoCategoriasSection() {
  const categorias = [
    { id: 1, icon: '🏋️', titulo: 'Mancuernas y Pesas' },
    { id: 2, icon: '👟', titulo: 'Calzado Deportivo' },
    { id: 3, icon: '👕', titulo: 'Ropa Deportiva' },
    { id: 4, icon: '🕶', titulo: 'Accesorios' },
  ];

  return (
    <section className="categorias-section">
      <h2 className="categorias-titulo">CATEGORÍAS DESTACADAS</h2>

      <div className="categorias">
        {categorias.map(function(categoria) {
          return (
            <div key={categoria.id} className="categoria-card">
              <div className="categoria-icon">{categoria.icon}</div>
              <h3>{categoria.titulo}</h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CarritoCategoriasSection;