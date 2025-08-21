import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fondo from '../logo.webp';
import logo from '../logo.webp';
import './Reportes.css';

import ReporteSemanalPreview from '../components/pdf/ReporteSemanalPreview';
import ReporteMensualPreview from '../components/pdf/ReporteMensualPreview';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reportes = () => {
  const navigate = useNavigate();

  const refSemanal = useRef();
  const refMensual = useRef();

  const [loadingSemanal, setLoadingSemanal] = useState(false);
  const [loadingMensual, setLoadingMensual] = useState(false);
  const [maxGasSemanal, setMaxGasSemanal] = useState(null);

  // Estados para datos mensuales
  const [temperaturaMaxima, setTemperaturaMaxima] = useState(null);
  const [datosGas, setDatosGas] = useState([]);

  // Nuevo estado para máximo gas mensual sin límite
  const [maxGasValor, setMaxGasValor] = useState(null);

  // Nuevos estados para datos semanales completos
  const [datosSemanal, setDatosSemanal] = useState([]);
  const [tempMaxSemanal, setTempMaxSemanal] = useState(null);

  // Estado para mostrar/ocultar menú desplegable usuario
  const [menuVisible, setMenuVisible] = useState(false);

  // Cargar datos al montar componente
  useEffect(() => {
    // Obtener temperatura máxima mensual
    fetch('http://localhost:3001/api/reporte_temperatura_mensual')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setTemperaturaMaxima(data[0].temperatura_maxima);
      })
      .catch((error) => console.error('Error al obtener temperatura mensual:', error));

    // Obtener datos gas mensual
    fetch('http://localhost:3001/api/reporte_gas_mensual')
      .then((res) => res.json())
      .then((data) => setDatosGas(data))
      .catch((error) => console.error('Error al obtener gas mensual:', error));

    // Obtener valor máximo de gas mensual sin límite
    fetch('http://localhost:3001/api/maximo_gas_mensual')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.max_gas !== null) {
          setMaxGasValor(data.max_gas);
        }
      })
      .catch((error) => console.error('Error al obtener máximo gas mensual:', error));

    // Obtener TODOS los datos del reporte semanal en una sola llamada
    fetch('http://localhost:3001/api/reporte_semanal')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setMaxGasSemanal(data.maxGas);
          setDatosSemanal(data.datos || []);
          setTempMaxSemanal(data.maxTemp || null);
        }
      })
      .catch(error => console.error('Error al obtener reporte semanal:', error));
  }, []);

  const generarPDF = async (ref, nombre, setLoading) => {
    if (!ref.current) return;
    try {
      setLoading(true);
      const canvas = await html2canvas(ref.current, { scale: 3 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(nombre);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión y evitar volver atrás
  const handleCerrarSesion = () => {
    localStorage.clear(); // Limpia toda la sesión guardada
    // Agrega aquí limpieza adicional si tienes cookies, context, etc.

    navigate('/', { replace: true }); // Redirige a la raíz y reemplaza la ruta para evitar volver atrás
  };

  // Opcional: Cerrar menú si clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.usuario-img') && !event.target.closest('.usuario-menu')) {
        setMenuVisible(false);
      }
    };

    if (menuVisible) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }

    return () => window.removeEventListener('click', handleClickOutside);
  }, [menuVisible]);

  return (
    <div className="reportes-container">
      <aside className="sidebar3">
        <div
          className="logo"
          onClick={() => navigate('/menu')}
          style={{ cursor: 'pointer' }}
        >
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="logo-text3">Gas Leak</span>
        </div>

        <div className="nav-buttons">
          <button onClick={() => navigate('/menu')}>MENU</button>
          <button onClick={() => navigate('/diario')}>DIARIO</button>
          <button onClick={() => navigate('/semanal')}>SEMANAL</button>
          <button onClick={() => navigate('/notificacion')}>EST. NOTIF</button>
          <button className="active">REPORTES</button>
        </div>
      </aside>

      <main className="main-content" style={{ backgroundImage: `url(${fondo})`, position: 'relative' }}>
        {/* Imagen usuario */}
        <img
          src="/usuario.jpg"
          alt="Usuario"
          className="usuario-img"
          onClick={() => setMenuVisible(!menuVisible)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 60,
            height: 60,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 0 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            zIndex: 10,
          }}
        />

        {/* Menú desplegable */}
        {menuVisible && (
          <div
            className="usuario-menu"
            style={{
              position: 'absolute',
              top: 75,
              right: 10,
              backgroundColor: 'white',
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              padding: '10px 15px',
              zIndex: 20,
              minWidth: 140,
              textAlign: 'center',
            }}
          >
            <button
              onClick={handleCerrarSesion}
              style={{
                width: '80%',
                padding: '8px',
                backgroundColor: '#ffa200',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              Cerrar Sesión
            </button>
            <button
              
              style={{
                width: '80%',
                padding: '8px',
                backgroundColor: '#ffffffff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            ></button>


            <button
  onClick={() => {
    const link = document.createElement('a');
    link.href = '/Manual%20Usuario.pdf'; // o '/Manual_Usuario.pdf' si lo renombraste
    link.download = 'Manual Usuario.pdf';
    link.click();
  }}
  style={{
                width: '80%',
                padding: '8px',
                backgroundColor: '#ffa200',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
>
  Manual de Usuario
</button>     


            
          </div>
        )}

        <div className="overlay">
          <h1>REPORTES GENERALES DE LAS CONDICIONES DEL AMBIENTE</h1>
          <p>Genera un PDF con los datos registrados durante la semana o el mes</p>

          <div className="descarga-section">
            <div className="descarga">
              <p>MENSUAL</p>
              <button
                className="descarga-btn"
                onClick={() => generarPDF(refMensual, 'reporte_mensual.pdf', setLoadingMensual)}
                disabled={loadingMensual}
              >
                {loadingMensual ? 'Generando...' : 'DESCARGAR'}
              </button>
            </div>

            <div className="descarga">
              <p>SEMANAL</p>
              <button
                className="descarga-btn"
                onClick={() => generarPDF(refSemanal, 'reporte_semanal.pdf', setLoadingSemanal)}
                disabled={loadingSemanal}
              >
                {loadingSemanal ? 'Generando...' : 'DESCARGAR'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Vistas ocultas para PDF (NO tienen botón interno) */}
      <div ref={refMensual} style={{ position: 'absolute', top: '-9999px' }}>
        <ReporteMensualPreview
          temperaturaMaxima={temperaturaMaxima}
          datosGas={datosGas}
          maxGasValor={maxGasValor}
        />
      </div>

      <div ref={refSemanal} style={{ position: 'absolute', top: '-9999px' }}>
        <ReporteSemanalPreview
          maxGasSemanal={maxGasSemanal}
          datosSemanal={datosSemanal}
          tempMaxSemanal={tempMaxSemanal}
        />
      </div>
    </div>
  );
};

export default Reportes;
