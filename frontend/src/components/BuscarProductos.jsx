import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function BuscarProductos({ alAgregarAlCarrito }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || ''; // Extrae el término de la URL (?query=...)
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarResultadosBusqueda = async () => {
      setLoading(true);
      try {
        // Hacemos el fetch mandándole el término al parámetro de búsqueda de tu backend (?buscar=)
        const res = await fetch(`http://localhost:5001/api/productos?buscar=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setProductos(data);
        }
      } catch (err) {
        console.error("Error al buscar productos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarResultadosBusqueda();
  }, [query]); // Se vuelve a ejecutar automáticamente cada vez que el usuario busque otra palabra

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>Buscando en el catálogo ancestral...</p>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      <h2 style={{ color: '#2d3748', borderBottom: '2px solid #8b1e2d', paddingBottom: '10px', marginBottom: '30px' }}>
        Resultados para: <span style={{ color: '#8b1e2d' }}>"{query}"</span>
      </h2>

      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          <h3>⚠️ No encontramos productos que coincidan con tu búsqueda.</h3>
          <p>Prueba con palabras clave como "Camiseta", "Gorra" o revisa la ortografía.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
          {productos.map((prod) => {
            return (
              <div key={prod.id_producto} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ padding: '15px', textAlign: 'center', background: '#f7fafc' }}>
                  <img 
                    src={`/${prod.foto_url}`} 
                    alt={prod.nombre} 
                    style={{ height: '200px', objectFit: 'contain', maxWidth: '100%' }}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=No+Image'}
                  />
                </div>
                
                <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '16px' }}>{prod.nombre}</h4>
                    <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 12px 0', lineHeight: '1.4' }}>{prod.descripcion}</p>
                    <div style={{ color: '#ecc94b', marginBottom: '10px', fontSize: '14px' }}>
                      {'⭐'.repeat(Math.round(prod.estrellas || 5))}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b1e2d', margin: '0 0 15px 0' }}>
                      ${parseFloat(prod.precio_base).toLocaleString('es-CO')}
                    </p>
                    
                    <button 
                      onClick={() => alAgregarAlCarrito(prod)}
                      style={{ width: '100%', background: '#2d3748', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                    >
                      🛒 Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}