import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    celular: '',
    correo: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue y rompa el ciclo de React

    try {
      const res = await fetch('http://localhost:5001/api/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form) // Enviamos el objeto con todos los datos capturados
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 ¡Registro exitoso en Fuerza Ancestral! Ya puedes iniciar sesión.");
        navigate('/login'); // Redirección automática al Login
      } else {
        alert("❌ Error en el registro: " + (data.mensaje || data.error));
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("No se pudo establecer conexión con el servidor de la tienda.");
    }
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ background: '#f7fafc', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderTop: '4px solid #8b1e2d' }}>
        <h2 style={{ textAlign: 'center', color: '#2d3748', marginTop: 0 }}>Crear Cuenta</h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#718096', marginBottom: '20px' }}>Únete a la comunidad de Fuerza Ancestral</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Nombre Completo</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e0' }} placeholder="Juan Pérez" />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Dirección de Envío</label>
            <input type="text" name="direccion" value={form.direccion} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e0' }} placeholder="Calle 5 # 24-03" />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Ciudad</label>
            <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e0' }} placeholder="Cali" />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Teléfono Celular</label>
            <input type="text" name="celular" value={form.celular} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e0' }} placeholder="315XXXXXXX" />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Correo Electrónico</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e0' }} placeholder="correo@ejemplo.com" />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568' }}>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #cbd5e0' }} placeholder="******" />
          </div>

          <button type="submit" style={{ background: '#8b1e2d', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: '0.2s' }}>
            Registrarse
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '15px', color: '#4a5568' }}>
          ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#8b1e2d', fontWeight: 'bold', textDecoration: 'none' }}>Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}