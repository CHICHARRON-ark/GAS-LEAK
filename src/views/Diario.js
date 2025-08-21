import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./diario.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import logo from "../logo.webp";

// Si no hay datos reales, se usan datos simulados
const generarDatosSimulados = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hora = i % 12 === 0 ? 12 : i % 12;
    const sufijo = i < 12 ? "AM" : "PM";
    return {
      time: `${hora}:00 ${sufijo}`,
      gas: 0,
      temp: 0,
      gasPos: mapGasPosition(0),
      tempPos: mapTempPosition(0),
      hora_exacta: `${hora.toString().padStart(2, "0")}:00:00`
    };
  });
};

// Mapeo de valores de gas a posición en la gráfica
function mapGasPosition(valor) {
  if (valor <= 400) return 0.1;
  if (valor > 400 && valor <= 800) return 0.5;
  if (valor > 800) return 0.9;
  return 0.1;
}

// Mapeo de valores de temperatura
function mapTempPosition(valor) {
  if (valor <= 26) return 0.1;
  if (valor > 26 && valor <= 30) return 0.5;
  if (valor > 30) return 0.9;
  return 0.1;
}

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

function Diario() {
  const [expandGas, setExpandGas] = useState(false);
  const [expandTemp, setExpandTemp] = useState(false);
  const [data, setData] = useState([]);
  const [fecha, setFecha] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const hoy = new Date();
    setFecha(hoy.toLocaleDateString("es-ES"));

    fetch("http://localhost:3001/api/maximo-gas-por-hora")
      .then(res => res.json())
      .then(resGas => {
        if (resGas.success && Array.isArray(resGas.data)) {
          fetch("http://localhost:3001/api/maxima-temperatura-por-hora")
            .then(res => res.json())
            .then(resTemp => {
              const tempPorHora = {};
              if (resTemp.success && Array.isArray(resTemp.data)) {
                resTemp.data.forEach(item => {
                  const hora24 = item.hora.split(":")[0];
                  tempPorHora[hora24] = item.max_temperatura;
                });
              }

              const horasDia = Array.from({ length: 24 }, (_, i) => i);
              const datosCombinados = horasDia.map(hora => {
                const horaStr = hora.toString().padStart(2, "0");
                const gasData = resGas.data.find(item => item.hora.startsWith(horaStr));
                const horaNum = hora % 12 === 0 ? 12 : hora % 12;
                const sufijo = hora >= 12 ? "PM" : "AM";

                const gasValor = gasData?.nivel_ppm ?? 0;
                const tempValor = tempPorHora[horaStr] ?? 0;

                return {
                  time: `${horaNum}:00 ${sufijo}`,
                  gas: gasValor,
                  temp: tempValor,
                  gasPos: mapGasPosition(gasValor),
                  tempPos: mapTempPosition(tempValor),
                  hora_exacta: gasData?.hora || `${horaStr}:00:00`
                };
              });

              setData(datosCombinados);
            })
            .catch(() => {
              setData(generarDatosSimulados());
            });
        } else {
          setData(generarDatosSimulados());
        }
      })
      .catch(() => {
        setData(generarDatosSimulados());
      });
  }, []);

  const ultimo = data[data.length - 1] || {};
  const nivelGas = getGasLevel(ultimo.gas || 0);
  const nivelTemp = getTempLevel(ultimo.temp || 0);

  return (
    <div className="container">
      <aside className="sidebar2">
        <div className="logo" onClick={() => navigate("/menu")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="logo-text2">Gas Leak</span>
        </div>

        <nav className="nav-buttons">
          <button onClick={() => navigate("/menu")}>MENU</button>
          <button className="active">DIARIO</button>
          <button onClick={() => navigate("/semanal")}>SEMANAL</button>
          <button onClick={() => navigate("/notificacion")}>EST. NOTIF</button>
          <button onClick={() => navigate("/reportes")}>REPORTES</button>
        </nav>
      </aside>

      <div className="diario-container">
        <h2 className="titulo">LECTURAS MÁS ALTAS REGISTRADAS DURANTE EL DÍA</h2>
        <p className="fecha">{fecha}</p>

        {/* Gráfico de Gas */}
        <div className="fila-grafico">
          <div className="label-eje">Nivel de Gas</div>
          <div className={`grafico-container ${expandGas ? "expandido" : ""}`} onClick={() => setExpandGas(!expandGas)}>
            <div className="grafico-scroll-wrapper" style={{ overflowX: expandGas ? "auto" : "hidden" }}>
              <div className="grafico-contenido" style={{ minWidth: expandGas ? "1200px" : "100%" }}>
                <ResponsiveContainer width="100%" height={expandGas ? 200 : 120}>
                  <LineChart data={data}>
                    <YAxis hide domain={[0, 1]} />
                    {expandGas && (
                      <XAxis dataKey="time" interval={0} angle={-45} textAnchor="end" height={60} />
                    )}
                    <Tooltip
                      formatter={(value, name, props) => [`${props.payload.gas} ppm`, "Gas"]}
                      labelFormatter={(label, props) => {
                        const horaExacta = props && props[0]?.payload?.hora_exacta;
                        return `Hora: ${horaExacta || label}`;
                      }}
                    />
                    <Line type="monotone" dataKey="gasPos" stroke="#FF4500" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="marcadores-lateral">
              <img src="/peligro.png" alt="Nivel peligroso" className="icono-nivel" />
              <img src="/alerta.png" alt="Nivel de alerta" className="icono-nivel" />
              <img src="/seguro.png" alt="Nivel seguro" className="icono-nivel" />
            </div>

            <div className="indicador-lateral" style={{ top: `${nivelGas * 40 + 10}px` }} />
          </div>
        </div>

        {/* Gráfico de Temperatura */}
        <div className="fila-grafico">
          <div className="label-eje">Temperatura</div>
          <div className={`grafico-container ${expandTemp ? "expandido" : ""}`} onClick={() => setExpandTemp(!expandTemp)}>
            <div className="grafico-scroll-wrapper" style={{ overflowX: expandTemp ? "auto" : "hidden" }}>
              <div className="grafico-contenido" style={{ minWidth: expandTemp ? "1200px" : "100%" }}>
                <ResponsiveContainer width="100%" height={expandTemp ? 200 : 120}>
                  <LineChart data={data}>
                    <YAxis hide domain={[0, 1]} />
                    {expandTemp && (
                      <XAxis dataKey="time" interval={0} angle={-45} textAnchor="end" height={60} />
                    )}
                    <Tooltip formatter={(value, name, props) => [`${props.payload.temp} °C`, "Temp"]} />
                    <Line type="monotone" dataKey="tempPos" stroke="#1E90FF" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="marcadores-lateral">
              <img src="/peligro.png" alt="Nivel peligroso" className="icono-nivel" />
              <img src="/alerta.png" alt="Nivel de alerta" className="icono-nivel" />
              <img src="/seguro.png" alt="Nivel seguro" className="icono-nivel" />
            </div>

            <div className="indicador-lateral" style={{ top: `${nivelTemp * 40 + 10}px` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Diario;
