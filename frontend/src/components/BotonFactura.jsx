// src/components/BotonFactura.jsx
import React from 'react';

export default function BotonFactura({ idPedido }) {
  const descargarFactura = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/pedidos/${idPedido}/factura`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('No se pudo descargar');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura_FA_${idPedido}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert('❌ Error al obtener el PDF');
    }
  };

  return (
    <button onClick={descargarFactura} className="btn-factura">
      📄 Descargar Factura PDF
    </button>
  );
}