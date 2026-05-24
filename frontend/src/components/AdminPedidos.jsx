import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos el hook de navegación

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate(); // 2. Inicializamos la navegación

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5001/api/admin/pedidos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPedidos(data))
      .catch(err => console.error(err));
  };

  const cambiarEstado = async (id_pedido, nuevoEstado) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5001/api/admin/pedidos/${id_pedido}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      cargarPedidos(); 
    } catch (err) {
      console.error(err);
    }
  };

  const obtenerBadgeEstado = (estado) => {
    const estilos = {
      'PENDIENTE_PAGO': { icon: '⏳', color: '#ff9800' },
      'PAGADO': { icon: '✅', color: '#4caf50' },
      'EN_PREPARACION': { icon: '📦', color: '#2196f3' },
      'ENVIADO': { icon: '🚚', color: '#9c27b0' },
      'CANCELADO': { icon: '❌', color: '#f44336' }
    };
    return estilos[estado] || { icon: '•', color: '#ccc' };
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: '950px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* ================= HEADER CON ACCESO DIRECTO A STOCK ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontFamily: 'Montserrat', fontWeight: '700', color: '#2d3748' }}>
          Pedidos de Hoy
        </h2>
        
        {/* Botón de redirección estilizado */}
        <button
          onClick={() => navigate('/admin/stock')}
          style={{
            background: '#319795',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(49,151,149,0.15)',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2c7a7b'}
          onMouseOut={(e) => e.currentTarget.style.background = '#319795'}
        >
          📦 Modificar Stock / Inventario
        </button>
      </div>
      
      {/* ================= TABLA DE PEDIDOS SIMPLIFICADA ================= */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'center', background: '#f7f9fa' }}>
            <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>No. Pedido</th>
            <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Cliente</th>
            <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Fecha</th>
            <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Estado</th>
            <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Total</th>
            <th style={{ padding: '15px', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id_pedido} style={{ borderBottom: '1px solid #edf2f7', textAlign: 'center', transition: 'background 0.2s' }}>
              
              {/* 1. id_pedido */}
              <td style={{ padding: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                #{pedido.id_pedido}
              </td>
              
              {/* 2. Nombre del usuario */}
              <td style={{ padding: '15px', color: '#4a5568', fontWeight: '500' }}>
                {pedido.nombre_usuario}
              </td>
              
              {/* 3. fecha */}
              <td style={{ padding: '15px', color: '#4a5568', fontSize: '14px' }}>
                {new Date(pedido.fecha).toLocaleDateString('es-CO')}
              </td>
              
              {/* 4. estado */}
              <td style={{ padding: '15px' }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    pedido.estado === 'ENTREGADO' || pedido.estado === 'PAGADO' ? '#e6fffa' : 
                    pedido.estado === 'ENVIADO' ? '#ebf8ff' : '#fff5f5',
                  color: 
                    pedido.estado === 'ENTREGADO' || pedido.estado === 'PAGADO' ? '#319795' : 
                    pedido.estado === 'ENVIADO' ? '#3182ce' : '#e53e3e'
                }}>
                  {pedido.estado}
                </span>
              </td>
              
              {/* 5. total */}
              <td style={{ padding: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                ${Number(pedido.total).toLocaleString('es-CO')}
              </td>
              
              {/* Botón de Acciones */}
              <td style={{ padding: '15px' }}>
                <button 
                  onClick={() => console.log('Ver detalle del pedido:', pedido.id_pedido)}
                  style={{
                    padding: '8px 16px',
                    background: '#3182ce',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#2b6cb0'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#3182ce'}
                >
                  Detalles
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}