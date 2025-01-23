const { query } = require("../database/db.js");
const path = require("path");

// Función para renderizar el status de todas las reservaciones
exports.verReservas = async (req, res) => {
  try {
    // Consulta para obtener las reservas (habitaciones reservadas) desde la tabla `reservas`
    const reservas = await query(`
      SELECT id_habitacion, fecha_entrada, fecha_salida, estado
      FROM reservas
      WHERE estado IN ('confirmada', 'activa', 'pre-reservada')
    `);

    // Función para formatear las fechas
    const formDate = (dateStr) => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses de 0-11
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Formatear las fechas de entrada y salida
    reservas.forEach((reserva) => {
      reserva.fecha_entrada = formDate(reserva.fecha_entrada);
      reserva.fecha_salida = formDate(reserva.fecha_salida);
    });

    // Renderiza la vista de reservas, pasando las reservas como datos
    res.render("statusReservaciones", { reservas });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener las reservas: " + err.message);
  }
};
