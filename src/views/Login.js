import React, { useState, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // 🔐 Al visitar el login, limpiar cualquier sesión previa
  useEffect(() => {
    localStorage.removeItem('auth');
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth', 'true'); // marcar como autenticado
        navigate('/menu'); // redirige al menú
      } else {
        setMensaje(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="title">GAS LEAK</h1>
        <h2 className="subtitle">iniciar sesión</h2>

        <input
          type="text"
          placeholder="correo:"
          className="input"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="contraseña:"
          className="input"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <button className="login-button" onClick={handleLogin}>
          iniciar sesión
        </button>

        {mensaje && <p className="error-message">{mensaje}</p>}
      </div>
    </div>
  );
}

export default Login;
