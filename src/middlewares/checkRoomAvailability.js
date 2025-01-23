const { query } = require("../database/db.js");

// Función auxiliar para verificar la disponibilidad de la habitación
const checkAvailability = async (habitacion, entrada, salida) => {
  const queryString = `
    SELECT estado, fecha_entrada, fecha_salida
    FROM reservas
    WHERE id_habitacion = ?
      AND estado IN ('activa', 'pre-reservada', 'reservada')
      AND (
        (fecha_entrada <= ? AND fecha_salida >= ?)
        OR (fecha_entrada <= ? AND fecha_salida >= ?)
        OR (fecha_entrada >= ? AND fecha_salida <= ?)
      )
  `;
  const params = [
    habitacion,
    entrada,
    entrada,
    salida,
    entrada,
    salida,
    entrada,
    salida,
  ];
  return await query(queryString, params);
};

// Función auxiliar para manejar errores
const handleError = (res, err) => {
  console.error("Error al verificar la disponibilidad de la habitación: ", err);
  res.status(500).render("registro", { error: "Error en el servidor" });
};

// Middleware para verificar la disponibilidad de la habitación
const checkRoomAvailability = async (req, res, next) => {
  const { habitacion, entrada, salida } = req.body;

  try {
    const disponibilidad = await checkAvailability(habitacion, entrada, salida);

    if (disponibilidad.length > 0) {
      return res.render("registro", {
        error: "La habitación no está disponible en las fechas seleccionadas",
      });
    }

    next();
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = checkRoomAvailability;
