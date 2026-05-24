import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function CategoriaProductos({ alAgregarAlCarrito }) {
  const { id_categoria } = useParams(); // Obtiene el id directamente desde la URL
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Conexión Backend: Traemos todos los productos activos de la API
    fetch('http://localhost:5001/api/productos')
      .then(res => res.json())
      .then(data => {
        // Filtramos en el cliente por la categoría correspondiente
        const filtrados = data.filter(p => p.id_categoria === parseInt(id_categoria));
        setProductos(filtrados);
        setCargando(false);
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, [id_categoria]);

  if (cargando) return <div style={{ textAlign: 'center', padding: '5px' }}>Cargando la fuerza ancestral...</div>;

  return (
    <div style={{ padding: '40px 10%' }}>
      <h2 className="categorias-titulo" style={{ textTransform: 'uppercase' }}>
        Explorando Productos
      </h2>
      
      {productos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Próximamente agregaremos más stock a esta sección.</p>
      ) : (
        <div className="productos-grid">
          {productos.map(producto => (
            <div key={producto.id_producto} className="producto-card" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
              <img src={`/${producto.foto_url}`} alt={producto.nombre} onError={(e)=>{e.target.src='https://via.placeholder.com/200'}} />
              <div style={{ padding: '15px 0' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>{producto.nombre}</h3>
                <p style={{ color: '#666', fontSize: '14px', height: '40px', overflow: 'hidden' }}>{producto.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span className="carrito-precio">${parseFloat(producto.precio_base).toLocaleString()}</span>
                  <span style={{ color: '#ffb400' }}>{'★'.repeat(producto.estrellas || 5)}</span>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '15px' }}
                  onClick={() => alAgregarAlCarrito(producto)}
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}