require("dotenv").config();
const { query, pool } = require("../database/db.js");

// Funciones auxiliares mejoradas
const getCurrentDateTime = () => {
  // Usar la zona horaria correcta para evitar problemas de hora
  // Evitando conversión de zona horaria que puede generar fechas inválidas
  return new Date();
};

const convertToISODate = (dateStr) => {
  // Verificar si la fecha está en un formato válido
  if (!dateStr) {
    throw new Error("Fecha nula o indefinida");
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Fecha inválida: ${dateStr}`);
    }

    // Usar método seguro para obtener la parte de fecha
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Error al convertir fecha '${dateStr}':`, error);
    // En caso de error, devolver la fecha actual como fallback
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
  }
};

// Función para iniciar una transacción
const beginTransaction = async () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }
        resolve(connection);
      });
    });
  });
};

// Función para ejecutar operaciones en una transacción
const executeTransaction = async (operations) => {
  let connection;
  try {
    connection = await beginTransaction();

    // Ejecutar todas las operaciones en la misma transacción
    for (const operation of operations) {
      await new Promise((resolve, reject) => {
        connection.query(operation.sql, operation.params, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    // Confirmar la transacción si todo está bien
    return new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) {
          connection.rollback(() => {
            connection.release();
            reject(err);
          });
          return;
        }
        connection.release();
        resolve(true);
      });
    });
  } catch (error) {
    // Revertir la transacción en caso de error
    if (connection) {
      return new Promise((resolve, reject) => {
        connection.rollback(() => {
          connection.release();
          reject(error);
        });
      });
    }
    throw error;
  }
};

// Funciones de actualización mejoradas con transacciones
const updateReservationAndRoomStatus = async (
  id_reserva,
  estadoReserva,
  id_habitacion,
  estadoHabitacion
) => {
  try {
    const operations = [
      {
        sql: `UPDATE reservas SET estado = ? WHERE id_reserva = ?`,
        params: [estadoReserva, id_reserva],
      },
    ];

    if (id_habitacion) {
      operations.push({
        sql: `UPDATE habitaciones SET estado = ? WHERE id_habitacion = ?`,
        params: [estadoHabitacion, id_habitacion],
      });
    }

    await executeTransaction(operations);
    console.log(
      `Actualización exitosa - Reserva: ${id_reserva} a ${estadoReserva}, Habitación: ${id_habitacion} a ${estadoHabitacion}`
    );
  } catch (error) {
    console.error(
      `Error al actualizar estados: Reserva ${id_reserva}, Habitación ${id_habitacion}`,
      error
    );
    throw error;
  }
};

// Mantener estas funciones para compatibilidad con código existente
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

// Función mejorada para obtener reservaciones
const getReservationsForRoom = async (id_habitacion) => {
  const queryString = `
    SELECT * FROM reservas 
    WHERE id_habitacion = ? 
    ORDER BY fecha_entrada ASC`;
  const params = [id_habitacion];
  return await query(queryString, params);
};

// Obtener la última reserva pero considerando múltiples criterios
const getLatestReservation = async (id_habitacion) => {
  const now = getCurrentDateTime();

  // Obtener fecha en formato string más seguro
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  // Primero buscamos reservas activas hoy
  const queryActiveToday = `
    SELECT * FROM reservas 
    WHERE id_habitacion = ? 
    AND fecha_entrada <= ? 
    AND fecha_salida >= ? 
    AND estado NOT IN ('cancelada', 'finalizada')
    ORDER BY fecha_entrada ASC 
    LIMIT 1`;

  const activeReservations = await query(queryActiveToday, [
    id_habitacion,
    today,
    today,
  ]);

  if (activeReservations.length > 0) {
    return activeReservations[0]; // Prioridad a reservas activas
  }

  // Si no hay activas, buscamos la próxima reserva futura
  const queryFuture = `
    SELECT * FROM reservas 
    WHERE id_habitacion = ? 
    AND fecha_entrada > ? 
    AND estado NOT IN ('cancelada', 'finalizada')
    ORDER BY fecha_entrada ASC 
    LIMIT 1`;

  const futureReservations = await query(queryFuture, [id_habitacion, today]);

  if (futureReservations.length > 0) {
    return futureReservations[0];
  }

  // Si no hay futuras, devolvemos la última cronológicamente
  const queryAny = `
    SELECT * FROM reservas 
    WHERE id_habitacion = ? 
    ORDER BY fecha_entrada DESC 
    LIMIT 1`;

  const result = await query(queryAny, [id_habitacion]);
  return result.length > 0 ? result[0] : null;
};

// Función principal de actualización de estados (MODIFICADA)
const updateReservationStates = async () => {
  const now = getCurrentDateTime();

  // Obtener fecha en formato string más seguro
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
  const currentHour = now.getHours();

  console.log(
    `Ejecutando actualización de estados con fecha: ${today}, hora: ${currentHour}`
  );

  // Primero, obtener todas las habitaciones
  const rooms = await query(`SELECT * FROM habitaciones`);

  for (const room of rooms) {
    const { id_habitacion } = room;

    // Obtener la reserva actual/más relevante para esta habitación
    const relevantReservation = await getLatestReservation(id_habitacion);

    if (!relevantReservation) {
      // Si no hay reservas para esta habitación, asegurarse de que esté disponible
      await updateRoomStatus(id_habitacion, 1);
      continue;
    }

    const { id_reserva, fecha_entrada, fecha_salida, estado } =
      relevantReservation;

    const entradaDate = convertToISODate(fecha_entrada);
    const salidaDate = convertToISODate(fecha_salida);

    // Procesar según el estado actual
    if (estado === "pre-reservada") {
      if (today < entradaDate) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "pre-reservada",
          id_habitacion,
          1
        );
      } else if (today >= entradaDate && today <= salidaDate) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "activa",
          id_habitacion,
          0
        );
      } else if (today > salidaDate) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "finalizada",
          id_habitacion,
          1
        );
      }
    } else if (estado === "reservada") {
      if (today < entradaDate) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "reservada",
          id_habitacion,
          1
        );
      } else if (today >= entradaDate && today <= salidaDate) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "activa",
          id_habitacion,
          0
        );
      } else if (today > salidaDate) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "finalizada",
          id_habitacion,
          1
        );
      }
    } else if (estado === "activa") {
      if (today > salidaDate) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "finalizada",
          id_habitacion,
          1
        );
      } else if (today === salidaDate && currentHour >= 13) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "en limpieza",
          id_habitacion,
          0
        );
      }
    } else if (estado === "en limpieza") {
      if (today === salidaDate && currentHour >= 15) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "disponible",
          id_habitacion,
          1
        );
      }
    } else if (estado === "mantenimiento") {
      if (today === salidaDate && currentHour >= 15) {
        await updateReservationAndRoomStatus(
          id_reserva,
          "disponible",
          id_habitacion,
          1
        );
      }
    } else if (
      estado === "cancelada" ||
      estado === "finalizada" ||
      estado === "disponible"
    ) {
      await updateRoomStatus(id_habitacion, 1);

      // Si hay otra reserva pendiente para esta habitación, no cambiar su estado
      const nextReservation = await query(
        `
        SELECT * FROM reservas 
        WHERE id_habitacion = ? 
        AND fecha_entrada >= ? 
        AND estado NOT IN ('cancelada', 'finalizada', 'disponible')
        ORDER BY fecha_entrada ASC 
        LIMIT 1
      `,
        [id_habitacion, today]
      );

      if (nextReservation.length > 0) {
        // Hay otra reserva pendiente, mantener su estado actual
        console.log(
          `La habitación ${id_habitacion} tiene otra reserva pendiente.`
        );
      }
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

  // Obtener fecha en formato string más seguro
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

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
          AND estado NOT IN ('cancelada', 'finalizada', 'disponible');
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

    // También verificar si la habitación está en mantenimiento
    const roomStatusQuery = `
      SELECT estado FROM habitaciones WHERE id_habitacion = ?
    `;

    const roomStatus = await query(roomStatusQuery, [id_habitacion]);

    if (roomStatus.length > 0 && roomStatus[0].estado === 0) {
      // La habitación está ocupada o en mantenimiento
      return true;
    }

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
  updateReservationAndRoomStatus,
};
