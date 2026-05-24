import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CarritoSidebar({ activo, cerrar, itemsCarrito, setCarrito }) {
  const navigate = useNavigate();

  // Estados para la gestión de cupones de descuento
  const [codigoCupon, setCodigoCupon] = useState('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);

  // 1. Cálculos matemáticos en tiempo real basados en los productos agregados
  const totalProductos = itemsCarrito.reduce((acumulado, item) => acumulado + item.cantidad, 0);
  const subtotal = itemsCarrito.reduce((acumulado, item) => acumulado + (parseFloat(item.precio_base) * item.cantidad), 0);
  
  // Cálculo del valor real a descontar basado en el cupón
  const valorDescuento = subtotal * (descuentoPorcentaje / 100);

  // Lógica de cobros adicionales: Si el carrito está vacío, estos valores deben ser $0
  const costoEnvio = itemsCarrito.length > 0 ? 10000 : 0;
  const impuestos = itemsCarrito.length > 0 ? 5000 : 0;
  
  // El total general ahora deduce el descuento del cupón de forma matemática segura
  const totalGeneral = (subtotal - valorDescuento) + costoEnvio + impuestos;

  // 2. Modificar cantidades directamente dentro del sidebar
  const cambiarCantidad = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      // Si la cantidad baja de 1, eliminamos el artículo
      setCarrito(itemsCarrito.filter(item => item.id_producto !== id_producto));
    } else {
      setCarrito(itemsCarrito.map(item => 
        item.id_producto === id_producto ? { ...item, cantidad: nuevaCantidad } : item
      ));
    }
  };

  // 3. Función para validar el cupón en la Base de Datos
  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) return;

    try {
      const res = await fetch(`http://localhost:5001/api/cupones/validar?codigo=${codigoCupon.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setDescuentoPorcentaje(data.porcentaje_descuento);
        alert(`🎉 ¡Cupón aplicado con éxito! Descuento del ${data.porcentaje_descuento}%`);
      } else {
        alert("❌ El cupón ingresado no es válido o ya caducó.");
        setDescuentoPorcentaje(0);
      }
    } catch (err) {
      console.error("Error validando cupón:", err);
    }
  };

  // 4. Flujo Protegido de Pago (Auth Check + RF 9 + RF 10)
  const procederAlPago = async () => {
    const token = localStorage.getItem('token');

    // PASO A: Verificar Inicio de Sesión
    if (!token) {
      alert("⚠️ Para proceder al pago, debes iniciar sesión o registrarte primero.");
      cerrar(); // Cierra el sidebar para no interrumpir el flujo visual
      navigate('/login', { state: { regresarAlCarrito: true } });
      return;
    }

    // PASO B: Confirmación de Dirección (RF 9)
    const usuarioNombre = localStorage.getItem('user_nombre') || "Cliente";
    const usuarioDireccion = localStorage.getItem('user_direccion');
    const usuarioCiudad = localStorage.getItem('user_ciudad');

    if (!usuarioDireccion || !usuarioCiudad) {
      alert("⚠️ Tu cuenta no posee una dirección de entrega configurada. Por favor, actualiza tus datos de registro.");
      return;
    }

    const confirmarDireccion = window.confirm(
      `📋 CONFIRMACIÓN DE ENVÍO - FUERZA ANCESTRAL\n\n` +
      `Estimado(a) ${usuarioNombre}, antes de pagar confirma si tu domicilio de entrega es correcto:\n` +
      `📍 Dirección: ${usuarioDireccion}\n` +
      `🏙️ Ciudad: ${usuarioCiudad}\n\n` +
      `¿Es esta la misma dirección donde deseas recibir el pedido actual?`
    );

    if (!confirmarDireccion) {
      alert("Operación pausada. Por seguridad, actualiza o valida tus datos de envío antes de proceder a la pasarela.");
      return;
    }

    // PASO C: Salto a la Pasarela de Mercado Pago (RF 10)
    try {
      const res = await fetch('http://localhost:5001/api/crear-preferencia', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: itemsCarrito,
          descuento: valorDescuento
        })
      });
      
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redirección directa al Checkout Seguro de Mercado Pago
      } else {
        alert("Ocurrió un error al inicializar el módulo de Mercado Pago.");
      }
    } catch (error) {
      console.error("Error al conectar con la pasarela:", error);
      alert("No se pudo conectar con el servidor de pagos.");
    }
  };

  return (
    <>
      {/* Fondo oscuro detrás del sidebar */}
      <div 
        className={`carrito-overlay ${activo ? 'activo' : ''}`} 
        onClick={cerrar}
      ></div>

      {/* Panel del Carrito deslizante */}
      <div className={`carrito ${activo ? 'activo' : ''}`}>
        <div className="carrito-header">
          <div>
            <h2>Carrito de compras</h2>
            <small>{totalProductos} Productos</small>
          </div>
          <button className="cerrar-btn" onClick={cerrar}>✖</button>
        </div>

        {/* Listado dinámico de ítems seleccionados */}
        <div className="carrito-contenido">
          {itemsCarrito.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#a0aec0' }}>
              <p style={{ fontSize: '24px' }}>🛒</p>
              <p>Tu carrito está vacío.</p>
              <small>¡Empieza a entrenar tu Fuerza Ancestral!</small>
            </div>
          ) : (
            itemsCarrito.map((item) => (
              <div key={item.id_producto} className="carrito-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #edf2f7', padding: '12px 0' }}>
                <img 
                  src={`/${item.foto_url}`} 
                  alt={item.nombre} 
                  style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px' }}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/50'} 
                />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{item.nombre}</h4>
                  <span style={{ color: '#2b6cb0', fontWeight: 'bold', fontSize: '14px' }}>
                    ${parseFloat(item.precio_base).toLocaleString('es-CO')}
                  </span>
                </div>
                {/* Controles de más y menos cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)} style={{ cursor: 'pointer', padding: '2px 8px' }}>-</button>
                  <span style={{ fontWeight: 'bold' }}>{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)} style={{ cursor: 'pointer', padding: '2px 8px' }}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Entrada del cupón funcional */}
        <div className="carrito-cupon">
          <h4>Cupón de descuento</h4>
          <div className="cupon-input">
            <input 
              type="text" 
              placeholder="Ingresa tu cupón" 
              value={codigoCupon}
              onChange={(e) => setCodigoCupon(e.target.value)}
            />
            <button onClick={aplicarCupon}>Aplicar</button>
          </div>
        </div>

        {/* Resumen dinámico calculado por JS */}
        <div className="carrito-resumen">
          <div><span>Subtotal</span><span>${subtotal.toLocaleString('es-CO')}</span></div>
          
          {/* Muestra la fila de descuento en tiempo real sólo si hay un porcentaje activo */}
          {valorDescuento > 0 && (
            <div style={{ color: '#e53e3e', fontWeight: '500' }}>
              <span>Descuento ({descuentoPorcentaje}%)</span>
              <span>-${valorDescuento.toLocaleString('es-CO')}</span>
            </div>
          )}
          
          <div><span>Envío</span><span>${costoEnvio.toLocaleString('es-CO')}</span></div>
          <div><span>Impuestos</span><span>${impuestos.toLocaleString('es-CO')}</span></div>
          <hr />
          <div className="total">
            <span>Total</span>
            <span>${totalGeneral.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="carrito-botones">
          <button 
            className="btn-pagar" 
            onClick={procederAlPago}
            disabled={itemsCarrito.length === 0} 
            style={{ opacity: itemsCarrito.length === 0 ? 0.6 : 1, cursor: itemsCarrito.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            🔒 Proceder al pago seguro
          </button>
          <button className="btn-seguir" onClick={cerrar}>Seguir comprando</button>
        </div>
      </div>
    </>
  );
}

export default CarritoSidebar;