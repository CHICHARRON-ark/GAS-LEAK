import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar
} from 'recharts';
import './ReportePreview.css';

const ReporteMensualPreview = ({ datosGas, temperaturaMaxima, maxGasValor }) => {
  // Función para formatear números con separadores de miles y decimales
  const formatoNumero = (num) => {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Fecha actual
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });



  // Usa maxGasValor si existe, si no, calcula máximo normal
  const maxGas = maxGasValor !== undefined && maxGasValor !== null
    ? maxGasValor
    : (datosGas && datosGas.length > 0
      ? Math.max(...datosGas.map(d => d.valor))
      : 0);

  // Para la mini gráfica de gas (asume 1500 como máximo)
  const gasMaximo = 1500;
  // Color dinámico para el aro del gas máximo
  const getGasRingColor = (valor) => {
    if (valor < 300) return "#ffe066"; // Amarillo
    if (valor >= 300 && valor < 600) return "#ffa200"; // Naranja
    return "#fe2020ff"; // Rojo
  };
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
      <h2>REPORTE MENSUAL</h2>
      {/* Fecha actual */}
      <p style={{ fontSize: 14, color: "#555", marginBottom: 24, textAlign: "center" }}>
        Fecha de impresión: {fechaActual}
      </p>

      <div className="medidores" style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 24 }}>
        {/* Gas máximo */}
        <div className="medidor" style={{ textAlign: "center", position: "relative" }}>
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
        <h3>Niveles de gas por mes (ppm) </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datosGas} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
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
        background: "#fffbe6",
        border: "2px solid #ffa200",
        borderRadius: 14,
        padding: 24,
        fontSize: 17,
        color: "#b30000",
        fontWeight: "bold",
        textAlign: "left",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
      }}>
        <h3 style={{ color: "#ff9900", marginTop: 0 }}>🔔 Recomendaciones de seguridad</h3>
        <ul style={{ margin: 0, paddingLeft: 24, color: "#b30000", fontWeight: "normal" }}>
          <li>Revisa periódicamente tus instalaciones de gas para evitar fugas.</li>
          <li>No ignores las notificaciones de niveles altos de gas.</li>
          <li>Ventila el área si detectas un aumento inusual en los niveles de gas.</li>
          <li>Contacta a un profesional si los niveles de gas son elevados de forma constante.</li>
          <li>Recuerda: ¡Cada minuto cuenta para tu seguridad y la de tu familia!</li>
        </ul>
      </div>
    </div>
  );
};

export default ReporteMensualPreview;
