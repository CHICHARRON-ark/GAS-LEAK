import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./semanal.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import logo from "../logo.webp";

function getGasLevel(valor) {
  if (valor > 1200) return 2;
  if (valor > 600) return 1;
  return 0;
}

function getTempLevel(valor) {
  if (valor > 30) return 2;
  if (valor > 26) return 1;
  return 0;
}

function Semanal() {
  const [expandGas, setExpandGas] = useState(false);
  const [expandTemp, setExpandTemp] = useState(false);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const filtrarUnicosPorFecha = (datos) => {
      const fechasVistas = new Set();
      const unicos = [];
      for (const item of datos) {
        const fechaSolo = item.fecha.split(" ")[0];
        if (!fechasVistas.has(fechaSolo)) {
          fechasVistas.add(fechaSolo);
          unicos.push({ ...item, fecha: fechaSolo });
        }
        if (unicos.length >= 7) break;
      }
      return unicos;
    };

    fetch("http://localhost:3001/api/max_gas_diario")
      .then((res) => res.json())
      .then((resGas) => {
        if (resGas.success && Array.isArray(resGas.data)) {
          let datosOrdenadosGas = resGas.data
            .slice()
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

          const unicosGas = filtrarUnicosPorFecha(datosOrdenadosGas);
          unicosGas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

          const gasData = unicosGas.map((item) => {
            const fechaObj = new Date(item.fecha);
            return {
              time: diasSemana[fechaObj.getDay()],
              fecha: item.fecha,
              gasOriginal: item.nivel_ppm,
            };
          });

          fetch("http://localhost:3001/api/max_temp_diario")
            .then((res) => res.json())
            .then((resTemp) => {
              if (resTemp.success && Array.isArray(resTemp.data)) {
                let datosOrdenadosTemp = resTemp.data
                  .slice()
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                const unicosTemp = filtrarUnicosPorFecha(datosOrdenadosTemp);
                unicosTemp.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                const combinado = gasData.map((gItem) => {
                  const tItem = unicosTemp.find((t) => t.fecha === gItem.fecha);

                  // --- GAS RANGE MAPPING ---
                  let gasVisual = 0;
                  const gasValor = gItem.gasOriginal;

                  if (gasValor < 400) {
                    gasVisual = Math.random() * 30 + 10;  // 10-40%
                  } else if (gasValor >= 400 && gasValor < 800) {
                    gasVisual = Math.random() * 30 + 40;  // 40-70%
                  } else {
                    gasVisual = Math.random() * 30 + 70;  // 70-100%
                  }

                  // --- TEMPERATURE RANGE MAPPING ---
                  let tempVisual = 0;
                  const tempValor = tItem ? tItem.temperatura_c : 0;

                  if (tempValor < 26) {
                    tempVisual = Math.random() * 30 + 10;  // 10-40%
                  } else if (tempValor >= 26 && tempValor <= 30) {
                    tempVisual = Math.random() * 30 + 40;  // 40-70%
                  } else {
                    tempVisual = Math.random() * 30 + 70;  // 70-100%
                  }

                  return {
                    time: gItem.time,
                    fecha: gItem.fecha,
                    gas: gasVisual,
                    temp: tempVisual,
                    gasReal: gasValor,       // <-- Valor entero original
                    tempReal: tempValor       // <-- Valor entero original
                  };
                });

                setData(combinado);
              } else {
                setData(gasData);
              }
            })
            .catch(() => setData(gasData));
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]));
  }, []);

  const ultimo = data[data.length - 1] || {};
  const nivelGas = getGasLevel(ultimo.gasReal || 0);
  const nivelTemp = getTempLevel(ultimo.tempReal || 0);

  return (
    <div className="container">
      <aside className="sidebar5">
        <div
          className="logo"
          onClick={() => navigate("/menu")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="logo-text2">Gas Leak</span>
        </div>

        <nav className="nav-buttons">
          <button onClick={() => navigate("/menu")}>MENU</button>
          <button onClick={() => navigate("/diario")}>DIARIO</button>
          <button className="active">SEMANAL</button>
          <button onClick={() => navigate("/notificacion")}>EST. NOTIF</button>
          <button onClick={() => navigate("/reportes")}>REPORTES</button>
        </nav>
      </aside>

      <div className="diario-container">
        <h2 className="titulo">LECTURAS MAS ALTAS REGISTRADAS DURANTE LA SEMANA</h2>

        {/* Gráfico de gas */}
        <div className="fila-grafico">
          <div className="label-eje">Nivel de Gas</div>
          <div
            className={`grafico-container ${expandGas ? "expandido" : ""}`}
            onClick={() => setExpandGas(!expandGas)}
          >
            <div
              className="grafico-scroll-wrapper"
              style={{ overflowX: expandGas ? "auto" : "hidden" }}
            >
              <div
                className="grafico-contenido"
                style={{ minWidth: expandGas ? "1000px" : "100%" }}
              >
                <ResponsiveContainer width="100%" height={expandGas ? 200 : 120}>
                  <LineChart data={data}>
                    <YAxis hide domain={[0, 100]} />
                    {expandGas && (
                      <XAxis
                        dataKey="time"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                    )}
                    <Tooltip
  formatter={(value, name, props) => {
    const gasVal = props.payload.gasReal != null ? props.payload.gasReal : 0;
    return [`${gasVal} ppm`, "Gas"];
  }}
/>

                    <Line
                      type="monotone"
                      dataKey="gas"
                      stroke="#FF4500"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="marcadores-lateral">
              <img src="/peligro.png" alt="Nivel peligroso" className="icono-nivel" />
              <img src="/alerta.png" alt="Nivel de alerta" className="icono-nivel" />
              <img src="/seguro.png" alt="Nivel seguro" className="icono-nivel" />
            </div>

            <div
              className="indicador-lateral"
              style={{ top: `${nivelGas * 40 + 10}px` }}
            />
          </div>
        </div>

        {/* Gráfico de temperatura */}
        <div className="fila-grafico">
          <div className="label-eje">Temperatura</div>
          <div
            className={`grafico-container ${expandTemp ? "expandido" : ""}`}
            onClick={() => setExpandTemp(!expandTemp)}
          >
            <div
              className="grafico-scroll-wrapper"
              style={{ overflowX: expandTemp ? "auto" : "hidden" }}
            >
              <div
                className="grafico-contenido"
                style={{ minWidth: expandTemp ? "1000px" : "100%" }}
              >
                <ResponsiveContainer width="100%" height={expandTemp ? 200 : 120}>
                  <LineChart data={data}>
                    <YAxis hide domain={[0, 100]} />
                    {expandTemp && (
                      <XAxis
                        dataKey="time"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                    )}
                    <Tooltip
  formatter={(value, name, props) => {
    const tempVal = props.payload.tempReal != null ? props.payload.tempReal : 0;
    return [`${tempVal} °C`, "Temp"];
  }}
/>

                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#1E90FF"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="marcadores-lateral">
              <img src="/peligro.png" alt="Nivel peligroso" className="icono-nivel" />
              <img src="/alerta.png" alt="Nivel de alerta" className="icono-nivel" />
              <img src="/seguro.png" alt="Nivel seguro" className="icono-nivel" />
            </div>

            <div
              className="indicador-lateral"
              style={{ top: `${nivelTemp * 40 + 10}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Semanal;
