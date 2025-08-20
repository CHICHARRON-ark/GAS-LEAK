const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Pool de conexiones
const db = mysql.createPool({
  host: 'srv1455.hstgr.io',
  user: 'u647025124_jony',
  password: 'zZibAoJ4#',
  database: 'u647025124_GasLeak',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión al iniciar
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
  } else {
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
  }
});

// Ruta para validar inicio de sesión
app.post('/api/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  const sql = 'SELECT * FROM usuario WHERE correo = ? AND contrasena = ?';

  db.query(sql, [usuario, contrasena], (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta SQL:', err);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    if (results.length > 0) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  });
});

// Ruta para obtener la última lectura de gas
app.get('/api/ultima-medicion', (req, res) => {
  const sql = 'CALL obtener_lectura_actual_gas()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar el procedimiento de gas:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener datos de gas' });
    }

    const datos = results[0][0];
    if (datos) {
      res.json({
        success: true,
        ppm: datos.nivel_ppm,
        porcentaje: datos.porcentaje_gas,
        estado: datos.estado,
        fecha: datos.fecha,
        hora: datos.hora
      });
    } else {
      res.json({ success: false, message: 'No hay datos de gas disponibles' });
    }
  });
});

// Ruta para obtener la última lectura de temperatura
app.get('/api/ultima-temperatura', (req, res) => {
  const sql = 'CALL obtener_lectura_actual_temperatura()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar el procedimiento de temperatura:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener temperatura' });
    }

    const datos = results[0][0];
    if (datos) {
      res.json({
        success: true,
        temperatura: datos.temperatura_c,
        fecha: datos.fecha,
        hora: datos.hora
      });
    } else {
      res.json({ success: false, message: 'No hay datos de temperatura disponibles' });
    }
  });
});

// Ruta para obtener máximo gas por hora
app.get('/api/maximo-gas-por-hora', (req, res) => {
  const sql = 'CALL maximo_gas_por_hora()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar maximo_gas_por_hora:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener datos' });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// Ruta para obtener máxima temperatura por hora
app.get('/api/maxima-temperatura-por-hora', (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(hora, '%H:00') AS hora,
      MAX(temperatura_c) AS max_temperatura
    FROM temperatura
    WHERE fecha = CURDATE()
    GROUP BY DATE_FORMAT(hora, '%H:00')
    ORDER BY hora
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar maxima_temperatura_por_hora:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener datos' });
    }

    res.json({
      success: true,
      data: results
    });
  });
});

// Nueva ruta para obtener máximo gas diario por día (lunes a domingo)
app.get('/api/max_gas_diario', (req, res) => {
  const sql = 'CALL max_gas_diario()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar max_gas_diario:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener datos' });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// Nueva ruta para obtener máxima temperatura diaria por día (lunes a domingo)
app.get('/api/max_temp_diario', (req, res) => {
  const sql = 'CALL max_temp_diario()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar max_temp_diario:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener datos' });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// Nueva ruta para obtener datos del reporte semanal de temperatura
app.get('/api/reporte_temperatura_semanal', (req, res) => {
  const sql = 'CALL reporte_temperatura_semanal()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar reporte_temperatura_semanal:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener datos del reporte semanal de temperatura' });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

// Ruta para obtener la temperatura máxima semanal (un solo dato)
app.get('/api/max_temp_semanal', (req, res) => {
  const sql = 'CALL obtener_maximo_semanal_temperatura()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar obtener_maximo_semanal_temperatura:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener temperatura semanal' });
    }

    const dato = results[0][0]; // un solo resultado esperado

    res.json({
      success: true,
      max: dato ? dato.temperatura_c : null,
      fecha: dato ? dato.fecha : null,
      hora: dato ? dato.hora : null,
    });
  });
});

// Ruta para obtener gas máximo semanal (reutiliza max_gas_diario)
app.get('/api/gas_max_semanal', (req, res) => {
  const sql = 'CALL max_gas_diario()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar max_gas_diario:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener gas máximo semanal' });
    }

    const datos = results[0];
    if (datos.length > 0) {
      const maxGas = Math.max(...datos.map(item => item.porcentaje_gas));
      res.json({ success: true, max: maxGas });
    } else {
      res.json({ success: false, message: 'No hay datos de gas semanal disponibles' });
    }
  });
});

// ** NUEVA RUTA PARA REPORTE SEMANAL COMPLETO (gas diario limitado + máximo real sin límite + temp max semanal) **
app.get('/api/reporte_semanal', (req, res) => {
  const formatearDia = (dia) => {
    const diasMap = {
      'Lun': 'Lunes',
      'Mar': 'Martes',
      'Mié': 'Miércoles',
      'Jue': 'Jueves',
      'Vie': 'Viernes',
      'Sáb': 'Sábado',
      'Dom': 'Domingo'
    };
    return diasMap[dia] || dia;
  };

  db.query('CALL reporte_gas_semanal()', (err, gasLimitadoResults) => {
    if (err) {
      console.error('❌ Error en reporte_gas_semanal:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener gas limitado semanal' });
    }

    // Aquí corregimos para que "valor" sea el nivel máximo limitado (nivel_max_limited) y no promedio_gas
    const datos = gasLimitadoResults[0].map(item => ({
      dia: formatearDia(item.dia_semana),
      valor: item.nivel_max_limited !== null ? item.nivel_max_limited : 0
    }));

    db.query('CALL maximo_gas_semanal()', (err2, maxGasSemanalResults) => {
      if (err2) {
        console.error('❌ Error en maximo_gas_semanal:', err2);
        return res.status(500).json({ success: false, message: 'Error al obtener máximo gas semanal' });
      }

      db.query('CALL obtener_maximo_semanal_temperatura()', (err3, maxTempSemanalResults) => {
        if (err3) {
          console.error('❌ Error en obtener_maximo_semanal_temperatura:', err3);
          return res.status(500).json({ success: false, message: 'Error al obtener temperatura semanal' });
        }

        const maxGas = maxGasSemanalResults[0][0]?.max_gas || null;
        const maxTemp = maxTempSemanalResults[0][0]?.temperatura_c || null;

        res.json({
          datos,
          maxGas,
          maxTemp
        });
      });
    });
  });
});

// Ruta para reporte mensual de temperatura
app.get("/api/reporte_temperatura_mensual", (req, res) => {
  const sql = "CALL reporte_temperatura_mensual()";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener reporte mensual:", err);
      return res.status(500).json({ error: "Error al obtener reporte mensual" });
    }
    res.json(results[0]);
  });
});

// Ruta para reporte mensual de gas
app.get('/api/reporte_gas_mensual', async (req, res) => {
  try {
    const [rows] = await db.promise().query('CALL reporte_gas_mensual()');
    const datos = rows[0].map((fila) => ({
      mes: fila.mes,
      valor: fila.promedio_gas,
    }));
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos del gas mensual:', error);
    res.status(500).json({ error: 'Error al obtener datos del gas mensual' });
  }
});

// RUTA TEST para verificar gas mensual
app.get('/api/test_gas_mensual', async (req, res) => {
  try {
    const [rows] = await db.promise().query('CALL reporte_gas_mensual()');
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error al obtener datos del gas mensual:', error);
    res.status(500).json({ success: false, error: 'Error al obtener datos del gas mensual' });
  }
});

app.get('/api/maximo_gas_mensual', (req, res) => {
  const sql = 'CALL maximo_gas_mensual()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar maximo_gas_mensual:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener máximo gas mensual' });
    }

    const dato = results[0][0]; // resultado esperado único

    res.json({
      success: true,
      max_gas: dato ? dato.max_gas : null,
      fecha: dato ? dato.fecha : null,
      hora: dato ? dato.hora : null,
    });
  });
});

app.get('/api/maximo_gas_semanal', (req, res) => {
  const sql = 'CALL maximo_gas_semanal()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar maximo_gas_semanal:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener máximo gas semanal' });
    }

    const dato = results[0][0]; // resultado esperado único

    res.json({
      success: true,
      max_gas: dato ? dato.max_gas : null,
      fecha: dato ? dato.fecha : null,
      hora: dato ? dato.hora : null,
    });
  });
});

// Ruta para obtener temperatura máxima semanal (un solo registro)
app.get('/api/temperatura_maxima_semanal', (req, res) => {
  const sql = 'CALL obtener_maximo_semanal_temperatura()';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al ejecutar obtener_maximo_semanal_temperatura:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener temperatura máxima semanal' });
    }

    const dato = results[0][0];

    res.json({
      success: true,
      temperatura_maxima: dato ? dato.temperatura_maxima : null,
      fecha: dato ? dato.fecha : null,
    });
  });
});


app.get('/api/notificaciones', async (req, res) => {
  try {
    const [results] = await db.promise().query('CALL obtener_estado_notificaciones()');

    const rows = results[0];

    let pendientes = 0;
    let vistas = 0;

    rows.forEach(row => {
      if (row.estado === 'pendiente') pendientes = row.cantidad;
      if (row.estado === 'visto') vistas = row.cantidad;
    });

    const data = [
      { name: 'Pendientes', value: pendientes },
      { name: 'Vistas', value: vistas }
    ];

    res.json(data);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});


//grafica tiempo visto promedio
app.get('/promedio-tiempo-visto', (req, res) => {
  const query = 'CALL PromedioTiempoVisto();';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener el promedio:', error);
      return res.status(500).json({ error: 'Error al obtener el promedio' });
    }

    const promedio = results[0][0]?.promedio_minutos || 0;
    res.json({ promedio_minutos: promedio });
  });
});





// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
