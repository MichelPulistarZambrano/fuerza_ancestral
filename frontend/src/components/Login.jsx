import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Captura el estado de redirección si el usuario venía del carrito

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error en las credenciales');
      }

      // Conexión Backend: Guardamos el token de seguridad y el objeto usuario original
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Guardamos los campos individuales para que CarritoSidebar.jsx los valide de inmediato (RF 9)
      localStorage.setItem('user_nombre', data.usuario.nombre);
      localStorage.setItem('user_direccion', data.usuario.direccion);
      localStorage.setItem('user_ciudad', data.usuario.ciudad);

      // REDIRECCIÓN INTELIGENTE:
      // Si el usuario venía de intentar pagar en el carrito, lo regresamos directamente allá
      if (location.state?.regresarAlCarrito) {
        navigate('/', { state: { abrirCarritoAlCargar: true } });
      } else if (data.usuario.rol === 'admin') {
        // Redirección por rol estándar
        navigate('/admin/pedidos');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '400px' }}>
        
        {/* Selector Moderno de Rol */}
        <div style={{ display: 'flex', marginBottom: '25px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
          <button 
            type="button"
            onClick={() => setIsAdmin(false)} 
            style={{ flex: 1, padding: '10px', background: !isAdmin ? '#8b1e2d' : '#fff', color: !isAdmin ? '#fff' : '#333', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            Cliente
          </button>
          <button 
            type="button"
            onClick={() => setIsAdmin(true)} 
            style={{ flex: 1, padding: '10px', background: isAdmin ? '#8b1e2d' : '#fff', color: isAdmin ? '#fff' : '#333', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            Administrador
          </button>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'Montserrat, sans-serif' }}>
          Iniciar Sesión {isAdmin ? 'Admin' : ''}
        </h2>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Correo Electrónico</label>
            <input 
              type="email" 
              value={correo} 
              onChange={(e) => setCorreo(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
            Ingresar a la Fuerza Ancestral
          </button>
        </form>

        {/* Enlace de Registro con Persistencia de Estado (RF 7) */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096', fontFamily: 'sans-serif' }}>
          ¿No tienes cuenta?{' '}
          <span 
            style={{ color: '#8b1e2d', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }} 
            onClick={() => navigate('/registro', { state: location.state })}
          >
            Regístrate aquí
          </span>
        </p>

      </div>
    </div>
  );
}