import React, { useState, useEffect } from 'react';

export default function AdminStock() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para Modal de Creación de Producto
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    id_categoria: 1, // Por defecto categoría 1, puedes cambiarlo según tu DB
    referencia: '',
    foto_url: '',
    nombre: '',
    descripcion: '',
    precio_base: ''
  });

  // Estados para Modal de Información Base (Edición)
  const [productoEditando, setProductoEditando] = useState(null);

  // Estados para Modal de Variantes (Stock / Precio)
  const [varianteEditando, setVarianteEditando] = useState(null);
  const [idProductoDeVariante, setIdProductoDeVariante] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/productos');
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Enviar nuevo producto al Servidor (POST)
  const handleCrearProducto = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5001/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...nuevoProducto,
          id_categoria: parseInt(nuevoProducto.id_categoria),
          precio_base: parseFloat(nuevoProducto.precio_base)
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 ¡Producto creado exitosamente en Fuerza Ancestral!");
        setMostrarModalCrear(false);
        // Limpiamos el formulario para la próxima
        setNuevoProducto({ id_categoria: 1, referencia: '', foto_url: '', nombre: '', descripcion: '', precio_base: '' });
        fetchProductos(); // Recarga la tabla para ver el nuevo registro
      } else {
        alert("❌ Error: " + data.mensaje);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  };

  // Enviar los cambios de Información Base al Servidor (PUT)
  const handleGuardarBase = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5001/api/productos/${productoEditando.id_producto}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productoEditando)
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 " + data.mensaje);
        setProductoEditando(null);
        fetchProductos(); 
      } else {
        alert("❌ Error: " + data.mensaje);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  };

  // Enviar los cambios de la Variante al Servidor (PUT)
  const handleGuardarVariante = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5001/api/variantes/${varianteEditando.id_variante}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stock: parseInt(varianteEditando.stock),
          precio_especifico: parseFloat(varianteEditando.precio_especifico),
          activo: varianteEditando.activo
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 " + data.mensaje);
        setVarianteEditando(null);
        fetchProductos(); 
      } else {
        alert("❌ Error: " + data.mensaje);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Cargando Inventario Ancestral...</p>;

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Encabezado con el nuevo botón de añadir */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #8b1e2d', paddingBottom: '10px' }}>
        <h2 style={{ color: '#2d3748', margin: 0 }}>Control de Inventario y Stock — Admin</h2>
        <button 
          onClick={() => setMostrarModalCrear(true)}
          style={{ background: '#2f855a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ➕ Añadir Producto
        </button>
      </div>

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#2d3748', color: 'white' }}>
            <th style={{ padding: '12px' }}>Producto</th>
            <th style={{ padding: '12px' }}>Ref</th>
            <th style={{ padding: '12px' }}>Precio Base</th>
            <th style={{ padding: '12px' }}>Variantes (Talla/Color/Stock)</th>
            <th style={{ padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => {
            const listaVariantes = typeof prod.variantes === 'string' ? JSON.parse(prod.variantes) : prod.variantes;

            return (
              <tr key={prod.id_producto} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={`/${prod.foto_url}`} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain' }} onError={(e) => e.target.src='https://via.placeholder.com/40'} />
                  <div>
                    <strong>{prod.nombre}</strong>
                    <br /><small style={{ color: '#718096' }}>{prod.descripcion?.substring(0, 50)}...</small>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>{prod.referencia}</td>
                <td style={{ padding: '12px' }}>${parseFloat(prod.precio_base).toLocaleString('es-CO')}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {listaVariantes && listaVariantes[0]?.id_variante !== null ? (
                      listaVariantes.map((v) => (
                        <div key={v.id_variante} style={{ fontSize: '13px', background: '#f7fafc', padding: '4px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                          <span>Talla {v.talla} - {v.color}: <strong>{v.stock} unds</strong> (${parseFloat(v.precio_especifico).toLocaleString('es-CO')})</span>
                          <button 
                            onClick={() => { setVarianteEditando(v); setIdProductoDeVariante(prod.id_producto); }}
                            style={{ background: '#edf2f7', border: '1px solid #cbd5e0', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', padding: '2px 6px' }}
                          >
                            ✏️ Stock
                          </button>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#a0aec0', fontSize: '13px' }}>Sin variantes añadidas</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => setProductoEditando(prod)}
                    style={{ background: '#8b1e2d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Editar Base
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ================= MODAL: CREAR NUEVO PRODUCTO ================= */}
      {mostrarModalCrear && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2d3748', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Añadir Nuevo Producto Base</h3>
            <form onSubmit={handleCrearProducto} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre del Producto</label>
                <input type="text" placeholder="Ej: Camiseta Fuerza Jaguar" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Referencia / SKU Padre</label>
                <input type="text" placeholder="Ej: REF-JAGUAR-01" value={nuevoProducto.referencia} onChange={e => setNuevoProducto({...nuevoProducto, referencia: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Precio Base ($ COP)</label>
                <input type="number" placeholder="Ej: 85000" value={nuevoProducto.precio_base} onChange={e => setNuevoProducto({...nuevoProducto, precio_base: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>ID Categoría (Asociado en BD)</label>
                <input type="number" value={nuevoProducto.id_categoria} onChange={e => setNuevoProducto({...nuevoProducto, id_categoria: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Descripción</label>
                <textarea placeholder="Describe el material, significado o detalles del diseño..." value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} rows="3" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Ruta de la Imagen (foto_url)</label>
                <input type="text" placeholder="Ej: assets/imagenes/jaguar.png" value={nuevoProducto.foto_url} onChange={e => setNuevoProducto({...nuevoProducto, foto_url: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, background: '#2f855a', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Crear Producto</button>
                <button type="button" onClick={() => setMostrarModalCrear(false)} style={{ flex: 1, background: '#718096', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDICIÓN PRODUCTO BASE ================= */}
      {productoEditando && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2d3748' }}>Editar Información Base</h3>
            <form onSubmit={handleGuardarBase} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre del Producto</label>
                <input type="text" value={productoEditando.nombre} onChange={e => setProductoEditando({...productoEditando, nombre: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Referencia (SKU Padre)</label>
                <input type="text" value={productoEditando.referencia} onChange={e => setProductoEditando({...productoEditando, referencia: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Precio Base ($)</label>
                <input type="number" value={productoEditando.precio_base} onChange={e => setProductoEditando({...productoEditando, precio_base: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Descripción</label>
                <textarea value={productoEditando.descripcion} onChange={e => setProductoEditando({...productoEditando, descripcion: e.target.value})} rows="3" style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>URL Foto</label>
                <input type="text" value={productoEditando.foto_url} onChange={e => setProductoEditando({...productoEditando, foto_url: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Estado Disponible</label>
                <select value={productoEditando.activo} onChange={e => setProductoEditando({...productoEditando, activo: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value={1}>Activo (Visible en tienda)</option>
                  <option value={0}>Inactivo (Oculto)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#2f855a', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
                <button type="button" onClick={() => setProductoEditando(null)} style={{ flex: 1, background: '#718096', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDICIÓN VARIANTE / STOCK ================= */}
      {varianteEditando && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#2d3748' }}>Modificar Stock y Precio Específico</h3>
            <p style={{ fontSize: '14px', color: '#4a5568' }}>Variante: <strong>Talla {varianteEditando.talla} / Color {varianteEditando.color}</strong></p>
            <form onSubmit={handleGuardarVariante} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Unidades Disponibles en Bodega (Stock)</label>
                <input type="number" value={varianteEditando.stock} onChange={e => setVarianteEditando({...varianteEditando, stock: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Precio Específico ($)</label>
                <input type="number" value={varianteEditando.precio_especifico} onChange={e => setVarianteEditando({...varianteEditando, precio_especifico: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <small style={{ color: '#718096' }}>Si coincide con el precio base original, déjalo igual.</small>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Estado Variante</label>
                <select value={varianteEditando.activo} onChange={e => setVarianteEditando({...varianteEditando, activo: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value={1}>Activa / Con Stock</option>
                  <option value={0}>Inactiva / Deshabilitada</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#2f855a', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Actualizar Variante</button>
                <button type="button" onClick={() => setVarianteEditando(null)} style={{ flex: 1, background: '#718096', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}