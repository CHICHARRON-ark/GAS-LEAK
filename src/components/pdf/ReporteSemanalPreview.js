import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar
} from 'recharts';
import './ReportePreview.css';

const ReporteSemanalPreview = () => {
  const [datosGas, setDatosGas] = useState([]);
  const [temperaturaMaxima, setTemperaturaMaxima] = useState(null);
  const [maxGasValor, setMaxGasValor] = useState(null);
  const [rangoSemana, setRangoSemana] = useState('');

  // Función para obtener lunes y domingo de la semana actual
  const calcularRangoSemana = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, ...
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1)); // Ajuste si es domingo
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const opciones = { day: '2-digit', month: 'long' }; // ej: 18 Agosto
    const lunesStr = lunes.toLocaleDateString('es-MX', opciones);
    const domingoStr = domingo.toLocaleDateString('es-MX', opciones);

    setRangoSemana(`${lunesStr} - ${domingoStr}`);
  };

  useEffect(() => {
    calcularRangoSemana();

    // Fetch datos gas semanal
    fetch('http://localhost:3001/api/reporte_semanal')
      .then(res => res.json())
      .then(data => {
        if (data && data.datos) {
          setDatosGas(data.datos);
          setMaxGasValor(data.maxGas);
        }
      })
      .catch(err => console.error('Error al obtener reporte semanal:', err));

    // Fetch temperatura máxima semanal
    fetch('http://localhost:3001/api/temperatura_maxima_semanal')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemperaturaMaxima(data.temperatura_maxima);
        }
      })
      .catch(err => console.error('Error al obtener temperatura máxima:', err));
  }, []);

  const formatoNumero = (num) => {
    if (num === null || num === undefined) return '-';
    if (typeof num === 'string') num = Number(num);
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const maxGas = maxGasValor !== undefined && maxGasValor !== null
    ? maxGasValor
    : (datosGas && datosGas.length > 0
      ? Math.max(...datosGas.map(d => d.valor))
      : 0);

  // Color dinámico para el aro del gas máximo
  const getGasRingColor = (valor) => {
    if (valor < 300) return "#ffe066"; // Amarillo
    if (valor >= 300 && valor < 600) return "#ffa200"; // Naranja
    return "#fe2020ff"; // Rojo
  };

  // Para la mini gráfica de gas (asume 1500 como máximo)
  const gasMaximo = 1500;
  const gasData = [
    { name: 'Gas', value: maxGas, fill: getGasRingColor(maxGas) },
    { name: 'Resto', value: Math.max(gasMaximo - maxGas, 0), fill: "#ffeaea" }
  ];

  // Para la mini gráfica de temperatura (asume 100°C como máximo)
  const tempMaximo = 100;
  const tempValue = temperaturaMaxima !== null ? Number(temperaturaMaxima) : 0;
  const tempData = [
    { name: 'Temp', value: tempValue, fill: "#fe2020ff" },
    { name: 'Resto', value: Math.max(tempMaximo - tempValue, 0), fill: "#ffeaea" }
  ];

  // Función para determinar el color de la barra según el valor
  const getBarColor = (valor) => {
    if (valor < 300) return "#ffe066"; // Amarillo
    if (valor >= 300 && valor < 600) return "#ffa200"; // Naranja
    return "#fe2020ff"; // Rojo
  };

  return (
    <div className="reporte-pdf">
      <h2>REPORTE SEMANAL</h2>
      {/* Rango de la semana */}
      <p style={{ fontSize: 14, color: "#555", marginTop: 4, marginBottom: 24, textAlign: "left" }}>
        Semana: {rangoSemana}
      </p>

      <div className="medidores" style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 24 }}>
        {/* Gas máximo */}
        <div className="medidor" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>Gas máximo</h3>
          <RadialBarChart
            width={150}
            height={150}
            cx={75}
            cy={75}
            innerRadius={55}
            outerRadius={70}
            barSize={20}
            data={gasData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
              cornerRadius={12}
            />
            <text
              x={75}
              y={80}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 26, fontWeight: "bold", fill: getGasRingColor(maxGas) }}
            >
              {formatoNumero(maxGas)}
            </text>
            <text
              x={75}
              y={110}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 15, fill: "#444" }}
            >
              ppm
            </text>
          </RadialBarChart>
        </div>
        {/* Temperatura máxima */}
        <div className="medidor" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>Temperatura máxima</h3>
          <RadialBarChart
            width={150}
            height={150}
            cx={75}
            cy={75}
            innerRadius={55}
            outerRadius={70}
            barSize={20}
            data={tempData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              minAngle={15}
              background
              clockWise
              dataKey="value"
              cornerRadius={12}
            />
            <text
              x={75}
              y={80}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 26, fontWeight: "bold", fill: "#fe2020ff" }}
            >
              {formatoNumero(tempValue)}
            </text>
            <text
              x={75}
              y={110}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 15, fill: "#444" }}
            >
              °C
            </text>
          </RadialBarChart>
        </div>
      </div>

      <div className="grafico-barras">
        <h3>Niveles de gas por día (ppm) </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosGas} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis
              ticks={[0, 200, 400, 600, 800, 1000, 1200, 1350, 1500]}
              domain={[0, 1500]}
              tick={{ fontSize: 12, fill: '#333' }}
              interval={0}
            />
            <Tooltip />
            <Bar dataKey="valor">
              {datosGas.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.valor)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recomendaciones al usuario */}
      <div style={{
        margin: "36px auto 0 auto",
        maxWidth: 600,
        background: "#fffdf0ff",
        border: "2px solid #ffa200",
        borderRadius: 14,
        padding: 24,
        fontSize: 17,
        color: "#b30000",
        fontWeight: "bold",
        textAlign: "left",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
      }}>
        <h3 style={{ color: "#ff7512ff", marginTop: 0 }}>🔔 Recomendaciones de seguridad</h3>
        <ul style={{ margin: 0, paddingLeft: 24, color: "#cd0000ff", fontWeight: "normal" }}>
          <li>Revisa periódicamente tus instalaciones de gas para evitar fugas.</li>
          <li>No ignores las notificaciones de niveles altos de gas.</li>
          <li>Si detectas un aumento inusual en los niveles de gas recuerda llamar a las autoridades.</li>
          <li>Contacta a un profesional si los niveles de gas son elevados de forma constante.</li>
          <li>Recuerda: ¡Cada minuto cuenta para tu seguridad y la de tu familia!</li>
        </ul>
      </div>
    </div>
  );
};

export default ReporteSemanalPreview;
