import React from 'react';

function Beneficios() {
  const beneficios = [
    { id: 1, icon: '🚚', texto: 'Envíos rápidos' },
    { id: 2, icon: '💳', texto: 'Pagos seguros' },
    { id: 3, icon: '🔄', texto: 'Devoluciones fáciles' },
  ];

  return (
    <section className="beneficios">
      {beneficios.map(function(beneficio) {
        return (
          <div key={beneficio.id} className="beneficio-item">
            <div className="beneficio-icon">{beneficio.icon}</div>
            <p>{beneficio.texto}</p>
          </div>
        );
      })}
    </section>
  );
}

export default Beneficios;