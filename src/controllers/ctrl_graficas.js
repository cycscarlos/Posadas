const { query } = require("../database/db.js");
const path = require("path");

exports.graficas = async (req, res) => {
  try {
    // Obtener las reservas de la base de datos agrupadas por mes
    const reservasPorMes = await query(`
      SELECT MONTH(fecha_entrada) AS mes, COUNT(*) AS total
      FROM reservas

      GROUP BY mes
      ORDER BY mes
    `);

    // Obtener las zonas de procedencia de los clientes
    const procedenciaData = await query(`
      SELECT IFNULL(procedencia, 'Sin procedencia') AS procedencia, COUNT(*) AS total
      FROM clientes
      GROUP BY procedencia
    `);

    // Procesar los datos para las gráficas
    const meses = reservasPorMes.map((item) => item.mes);
    const totalReservas = reservasPorMes.map((item) => item.total);

    const zonasProcedencia = procedenciaData.map((item) => item.procedencia);
    const totalPorProcedencia = procedenciaData.map((item) => item.total);

    // Renderizar la vista
    res.render("graficas", {
      meses,
      totalReservas,
      zonasProcedencia,
      totalPorProcedencia,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("Error al obtener los datos de las gráficas: " + err.message);
  }
};
