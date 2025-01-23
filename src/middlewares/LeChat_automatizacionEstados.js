require("dotenv").config();
const { query } = require("../database/db.js");

// Funciones auxiliares (sin cambios)
const getCurrentDateTime = () => new Date();
const convertToISODate = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date)) throw new Error(`Fecha inválida: ${dateStr}`);
  return date.toISOString().split("T")[0];
};
const updateReservationStatus = async (id_reserva, estado) => {
  try {
    await query(`UPDATE reservas SET estado = ? WHERE id_reserva = ?`, [
      estado,
      id_reserva,
    ]);
  } catch (error) {
    throw error;
  }
};
const updateRoomStatus = async (id_habitacion, estado) => {
  try {
    await query(`UPDATE habitaciones SET estado = ? WHERE id_habitacion = ?`, [
      estado,
      id_habitacion,
    ]);
  } catch (error) {
    throw error;
  }
};

const getLatestReservation = async (id_habitacion) => {
  const queryString = `SELECT * FROM reservas WHERE id_habitacion = ? ORDER BY fecha_entrada DESC LIMIT 1`;
  const params = [id_habitacion];
  const result = await query(queryString, params);
  return result.length > 0 ? result[0] : null;
};

// Función principal de actualización de estados (MODIFICADA)
// const updateReservationStates = async () => {
//   const now = getCurrentDateTime();
//   const today = now.toISOString().split("T")[0];
//   const currentHour = now.getHours();

//   console.log("Fecha actual:", today);
//   console.log("Hora actual:", currentHour);

//   const reservations = await query(`SELECT * FROM reservas`);

//   if (reservations.length === 0) {
//     console.log("No hay reservas para actualizar.");
//     return;
//   }

//   for (const reservation of reservations) {
//     const { id_reserva, fecha_entrada, fecha_salida, estado, id_habitacion } =
//       reservation;
//     const entradaDate = convertToISODate(fecha_entrada);
//     const salidaDate = convertToISODate(fecha_salida);

//     console.log(
//       `Procesando reserva ${id_reserva} para habitación ${id_habitacion}`
//     );
//     console.log(
//       `Fecha de entrada: ${entradaDate}, Fecha de salida: ${salidaDate}, Estado: ${estado}`
//     );

//     const latestReservation = await getLatestReservation(id_habitacion);
//     if (latestReservation && latestReservation.id_reserva !== id_reserva) {
//       console.log(
//         `Reserva ${id_reserva} no es la más reciente para la habitación ${id_habitacion}. Continuando...`
//       );
//       continue;
//     }

//     if (estado === "pre-reservada") {
//       if (today < entradaDate) {
//         console.log(`Reserva ${id_reserva} sigue en estado "pre-reservada".`);
//         await updateReservationStatus(id_reserva, "pre-reservada");
//         await updateRoomStatus(id_habitacion, 1);
//       } else if (today >= entradaDate && today <= salidaDate) {
//         console.log(`Reserva ${id_reserva} cambia a estado "activa".`);
//         await updateReservationStatus(id_reserva, "activa");
//         await updateRoomStatus(id_habitacion, 0);
//       } else if (today > salidaDate) {
//         console.log(`Reserva ${id_reserva} cambia a estado "finalizada".`);
//         await updateReservationStatus(id_reserva, "finalizada");
//         await updateRoomStatus(id_habitacion, 1);
//       }
//     } else if (estado === "reservada") {
//       if (today < entradaDate) {
//         console.log(`Reserva ${id_reserva} sigue en estado "reservada".`);
//         await updateReservationStatus(id_reserva, "reservada");
//         await updateRoomStatus(id_habitacion, 1);
//       } else if (today >= entradaDate && today <= salidaDate) {
//         console.log(`Reserva ${id_reserva} cambia a estado "activa".`);
//         await updateReservationStatus(id_reserva, "activa");
//         await updateRoomStatus(id_habitacion, 0);
//       } else if (today > salidaDate) {
//         console.log(`Reserva ${id_reserva} cambia a estado "finalizada".`);
//         await updateReservationStatus(id_reserva, "finalizada");
//         await updateRoomStatus(id_habitacion, 1);
//       }
//     } else if (estado === "activa") {
//       if (today > salidaDate) {
//         console.log(`Reserva ${id_reserva} cambia a estado "finalizada".`);
//         await updateReservationStatus(id_reserva, "finalizada");
//         await updateRoomStatus(id_habitacion, 1); // Actualización INMEDIATA
//       } else if (today === salidaDate && currentHour === 13) {
//         console.log(`Reserva ${id_reserva} cambia a estado "mantenimiento".`);
//         await updateReservationStatus(id_reserva, "mantenimiento");
//         await updateRoomStatus(id_habitacion, 0); // Actualización INMEDIATA
//       }
//     } else if (estado === "mantenimiento") {
//       if (today === salidaDate && currentHour === 15) {
//         console.log(`Reserva ${id_reserva} cambia a estado "disponible".`);
//         await updateReservationStatus(id_reserva, "disponible");
//         await updateRoomStatus(id_habitacion, 1); // Actualización INMEDIATA
//       }
//     } else if (
//       estado === "cancelada" ||
//       estado === "finalizada" ||
//       estado === "disponible"
//     ) {
//       console.log(`Reserva ${id_reserva} sigue en estado "${estado}".`);
//       await updateRoomStatus(id_habitacion, 1); // Actualización INMEDIATA
//     }
//   }
// };

//_ Nueva y "mejorada" manera de actualizar las reservas -LeChat recommendation
const updateReservationStates = async () => {
  const now = getCurrentDateTime();
  const today = now.toISOString().split("T")[0];
  const currentHour = now.getHours();

  console.log("Fecha actual:", today);
  console.log("Hora actual:", currentHour);

  const reservations = await query(
    `
    SELECT * FROM reservas
    WHERE (estado = 'pre-reservada' AND fecha_entrada <= ?)
       OR (estado = 'reservada' AND fecha_entrada <= ?)
       OR (estado = 'activa' AND fecha_salida <= ?)
       OR (estado = 'mantenimiento' AND fecha_salida <= ?)
  `,
    [today, today, today, today]
  );

  if (reservations.length === 0) {
    console.log("No hay reservas para actualizar.");
    return;
  }

  for (const reservation of reservations) {
    const { id_reserva, fecha_entrada, fecha_salida, estado, id_habitacion } =
      reservation;
    const entradaDate = convertToISODate(fecha_entrada);
    const salidaDate = convertToISODate(fecha_salida);

    console.log(
      `Procesando reserva ${id_reserva} para habitación ${id_habitacion}`
    );
    console.log(
      `Fecha de entrada: ${entradaDate}, Fecha de salida: ${salidaDate}, Estado: ${estado}`
    );

    const latestReservation = await getLatestReservation(id_habitacion);
    if (latestReservation && latestReservation.id_reserva !== id_reserva) {
      console.log(
        `Reserva ${id_reserva} no es la más reciente para la habitación ${id_habitacion}. Continuando...`
      );
      continue;
    }

    if (estado === "pre-reservada") {
      if (today < entradaDate) {
        console.log(`Reserva ${id_reserva} sigue en estado "pre-reservada".`);
        await updateReservationStatus(id_reserva, "pre-reservada");
        await updateRoomStatus(id_habitacion, 1);
      } else if (today >= entradaDate && today <= salidaDate) {
        console.log(`Reserva ${id_reserva} cambia a estado "activa".`);
        await updateReservationStatus(id_reserva, "activa");
        await updateRoomStatus(id_habitacion, 0);
      } else if (today > salidaDate) {
        console.log(`Reserva ${id_reserva} cambia a estado "finalizada".`);
        await updateReservationStatus(id_reserva, "finalizada");
        await updateRoomStatus(id_habitacion, 1);
      }
    } else if (estado === "reservada") {
      if (today < entradaDate) {
        console.log(`Reserva ${id_reserva} sigue en estado "reservada".`);
        await updateReservationStatus(id_reserva, "reservada");
        await updateRoomStatus(id_habitacion, 1);
      } else if (today >= entradaDate && today <= salidaDate) {
        console.log(`Reserva ${id_reserva} cambia a estado "activa".`);
        await updateReservationStatus(id_reserva, "activa");
        await updateRoomStatus(id_habitacion, 0);
      } else if (today > salidaDate) {
        console.log(`Reserva ${id_reserva} cambia a estado "finalizada".`);
        await updateReservationStatus(id_reserva, "finalizada");
        await updateRoomStatus(id_habitacion, 1);
      }
    } else if (estado === "activa") {
      if (today > salidaDate) {
        console.log(`Reserva ${id_reserva} cambia a estado "finalizada".`);
        await updateReservationStatus(id_reserva, "finalizada");
        await updateRoomStatus(id_habitacion, 1); // Actualización INMEDIATA
      } else if (today === salidaDate && currentHour === 13) {
        console.log(`Reserva ${id_reserva} cambia a estado "mantenimiento".`);
        await updateReservationStatus(id_reserva, "mantenimiento");
        await updateRoomStatus(id_habitacion, 0); // Actualización INMEDIATA
      }
    } else if (estado === "mantenimiento") {
      if (today === salidaDate && currentHour === 15) {
        console.log(`Reserva ${id_reserva} cambia a estado "disponible".`);
        await updateReservationStatus(id_reserva, "disponible");
        await updateRoomStatus(id_habitacion, 1); // Actualización INMEDIATA
      }
    } else if (
      estado === "cancelada" ||
      estado === "finalizada" ||
      estado === "disponible"
    ) {
      console.log(`Reserva ${id_reserva} sigue en estado "${estado}".`);
      await updateRoomStatus(id_habitacion, 1); // Actualización INMEDIATA
    }
  }
};


const checkDatabaseConnection = async () => {
  try {
    await query("SELECT 1");
    return true;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    return false;
  }
};

const automatizacionEstados = async (req, res, next) => {
  try {
    await updateReservationStates();
    if (typeof next === "function") {
      next();
    }
  } catch (error) {
    console.error("Error en automatizacionEstados:", error);
    if (error.code === "ECONNREFUSED") {
      if (res && typeof res.status === "function") {
        return res.status(503).render("checkServerDB", {
          message: "¡Servidor de la Base de Datos NO está activo!",
        });
      } else {
        console.error(
          "No se puede establecer el estado de respuesta debido a que 'res' es indefinido."
        );
        return;
      }
    }

    if (res && typeof res.status === "function") {
      res.status(500).render("checkServerDB", {
        message: "Error al conectar con la base de datos.",
      });
    } else {
      console.error(
        "No se puede establecer el estado de respuesta debido a que 'res' es indefinido."
      );
    }
  }
};

const executeOnServerStart = async () => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  console.log(
    JSON.stringify({
      level: "info",
      message: `Middleware ejecutado al iniciar el servidor el día ${today}`,
    })
  );

  try {
    await updateReservationStates();
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Error al verificar y actualizar los estados al iniciar el servidor: ¡Servidor de la Base de Datos NO está activo!"
      );
    } else {
      console.error(
        "Error al verificar y actualizar los estados al iniciar el servidor: ",
        error
      );
    }
  }
};

const checkRoomAvailability = async (
  id_habitacion,
  fecha_inicio,
  fecha_fin
) => {
  try {
    const queryText = `
            SELECT COUNT(*) AS count
            FROM reservas
            WHERE id_habitacion = ?
                AND (
                    (fecha_entrada <= ? AND fecha_salida >= ?) OR
                    (fecha_entrada BETWEEN ? AND ?) OR
                    (fecha_salida BETWEEN ? AND ?)
                )
                AND estado NOT IN ('cancelada', 'finalizada');
        `;

    const result = await query(queryText, [
      id_habitacion,
      fecha_fin,
      fecha_inicio,
      fecha_inicio,
      fecha_fin,
      fecha_inicio,
      fecha_fin,
    ]);

    return result[0].count > 0; // Devuelve true si hay reservas, false si no.
  } catch (error) {
    console.error(
      "Error al verificar la disponibilidad de la habitación:",
      error
    );
    return false; // En caso de error, se considera no disponible.
  }
};

module.exports = {
  getCurrentDateTime,
  convertToISODate,
  updateReservationStatus,
  updateRoomStatus,
  getLatestReservation,
  updateReservationStates,
  checkDatabaseConnection,
  automatizacionEstados,
  executeOnServerStart,
  checkRoomAvailability,
};
