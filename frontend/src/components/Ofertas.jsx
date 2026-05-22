import React from 'react';

function Ofertas() {
  return (
    <section className="ofertas">
      <h2 className="categorias-titulo">OFERTAS RELÁMPAGOS ⚡</h2>
      <div className="productos-grid" id="productos">
        {/* Aquí luego mapeo los productos del backend en React */}
        <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#666' }}>
          Próximamente productos...
        </p>
      </div>
      <button className="btn-outline">Ver más</button>
    </section>
  );
}

export default Ofertas;