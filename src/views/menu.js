import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GaugeComponent from 'react-gauge-component';
import { FaThermometerHalf } from 'react-icons/fa';
import logo from '../logo.webp';
import './menu.css';

function Menu() {
  const [velocidad, setVelocidad] = useState(0);
  const [temperatura, setTemperatura] = useState(0);
  const [estadoGas, setEstadoGas] = useState('seguro');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const resGas = await fetch('http://localhost:3001/api/ultima-medicion');
        const dataGas = await resGas.json();

        if (dataGas.success && dataGas.porcentaje) {
          const porcentajeNumerico = parseFloat(dataGas.porcentaje.replace('%', ''));
          setVelocidad(porcentajeNumerico);
          setEstadoGas(dataGas.estado);
        } else {
          setVelocidad(0);
          setEstadoGas('seguro');
        }

        const resTemp = await fetch('http://localhost:3001/api/ultima-temperatura');
        const dataTemp = await resTemp.json();

        if (dataTemp.success) {
          setTemperatura(dataTemp.temperatura);
        } else {
          setTemperatura(0);
        }
      } catch (error) {
        console.error('❌ Error al obtener datos en tiempo real:', error);
        setVelocidad(0);
        setTemperatura(0);
        setEstadoGas('seguro');
      }
    };

    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 5000);

    return () => clearInterval(intervalo);
  }, []);

  // Definir color según estado
  let colorValor;
  if (estadoGas === 'seguro') colorValor = '#5BE12C';       // verde
  else if (estadoGas === 'alerta') colorValor = '#F5CD19';  // amarillo
  else if (estadoGas === 'peligro') colorValor = '#EA4228'; // rojo
  else colorValor = '#000'; // negro por defecto

  return (
    <div className="container">
      <aside className="sidebar1">
        <div className="logo" onClick={() => navigate('/menu')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="logo-text1">Gas Leak</span>
        </div>
        <nav className="nav-buttons">
          <button className="active">MENU</button>
          <button onClick={() => navigate('/diario')}>DIARIO</button>
          <button onClick={() => navigate('/semanal')}>SEMANAL</button>
          <button onClick={() => navigate('/notificacion')}>EST. NOTIF</button>
          <button onClick={() => navigate('/reportes')}>REPORTES</button>
        </nav>
      </aside>

      <main className="main-content">
        <h1>
          REGISTRO EN TIEMPO REAL DE
          <br />
          MEDICIONES DEL AMBIENTE
        </h1>
        <h3>NIVEL DE GAS</h3>

        <div className="gauge-container">
          <GaugeComponent
            value={velocidad}
            minValue={0}
            maxValue={100}
            type="semicircle"
            arc={{
              subArcs: [
                { limit: 30, color: '#5BE12C' },
                { limit: 70, color: '#F5CD19' },
                { color: '#EA4228' }
              ]
            }}
            pointer={{ type: 'arrow', elastic: true }}
            labels={{
              valueLabel: {
                formatTextValue: (value) => `${value}%`,
                style: { fill: colorValor, fontSize: '30px', fontWeight: 'bold' }
              },
              markLabel: { marks: [{ value: 0 }, { value: 50 }, { value: 100 }] }
            }}
            style={{ width: 300, marginBottom: 20 }}
          />

          <div className="temperature-box">
            <FaThermometerHalf className="thermometer-icon" />
            <span className="temp-value">{temperatura}°</span>
            <p className="temp-label">Temperatura ambiente</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Menu;
