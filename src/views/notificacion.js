import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import logo from "../logo.webp";
import "./notificacion.css";

const colores = ["#ff0000ff", "#ffa200"]; // Pendientes, Vistas

function Notificacion() {
  const [data, setData] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/api/notificaciones")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error al cargar datos:", error));

    // Obtener el promedio de minutos vistos
    fetch("http://localhost:3001/promedio-tiempo-visto")
      .then((res) => res.json())
      .then((data) => setPromedio(data.promedio_minutos))
      .catch((error) => console.error("Error al cargar promedio:", error));
  }, []);

  // --- Ajuste de posición del indicador ---
  // La barra va de 0 a 60 minutos, el ancho visual es 100% (de 0 a 100%)
  // El promedio debe posicionarse proporcionalmente entre 0 y 60
  const getPromedioLeft = (prom) => {
    const min = 0;
    const max = 60;
    const val = Math.max(min, Math.min(Number(prom), max));
    return `calc(${(val / max) * 100}% - 12px)`;
  };

  return (
    <div className="container">
      <aside className="sidebar6">
        <div className="logo" onClick={() => navigate("/menu")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="logo-text2">Gas Leak</span>
        </div>

        <nav className="nav-buttons">
          <button onClick={() => navigate('/menu')}>MENU</button>
          <button onClick={() => navigate("/diario")}>DIARIO</button>
          <button onClick={() => navigate("/semanal")}>SEMANAL</button>
          <button className="active">EST. NOTIF</button>
          <button onClick={() => navigate("/reportes")}>REPORTES</button>
        </nav>
      </aside>

      <main className="diario-container">
        <h2 className="titulo">ESTADO DE NOTIFICACIONES</h2>
        <div className="grafico-notificacion">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={130}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Barra de tiempo promedio */}
        <div style={{
          margin: "32px auto 0 auto",
          maxWidth: 420,
          padding: 24,
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          textAlign: "center"
        }}>
          <div style={{ marginBottom: 12, fontWeight: "bold", fontSize: 18 }}>
            ⏱️ Tiempo promedio para ver notificaciones
          </div>
          {/* Barra de colores difuminados */}
          <div style={{
            position: "relative",
            height: 32,
            borderRadius: 16,
            background: "linear-gradient(90deg, #ffe066 0%, #ffa200 50%, #ff4d4d 100%)",
            marginBottom: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
          }}>
            {/* Indicador del promedio */}
            {promedio !== null && (
              <div style={{
                position: "absolute",
                left: getPromedioLeft(promedio),
                top: -8,
                width: 24,
                height: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "12px solid #222"
                }} />
                <div style={{
                  background: "#222",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "2px 8px",
                  fontSize: 14,
                  marginTop: 2
                }}>
                  {Number(promedio).toFixed(1)} min
                </div>
              </div>
            )}
          </div>
          {/* Intervalos de tiempo */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            color: "#888",
            marginTop: 2
          }}>
            <span>0 min</span>
            <span>30 min</span>
            <span>60+ min</span>
          </div>
          <div style={{ marginTop: 12, color: "#b30000", fontWeight: "bold", fontSize: 15 }}>
            ¡Cada minuto cuenta! No dejes acumular una fuga de gas.
          </div>
        </div>
      </main>
    </div>
  );
}

export default Notificacion;