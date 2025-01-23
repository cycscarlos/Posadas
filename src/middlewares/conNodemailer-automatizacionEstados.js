require("dotenv").config();

const { query } = require("../database/db.js");
const nodemailer = require("nodemailer");

// Configuración del transporte de correo electrónico
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Tu email
    pass: process.env.EMAIL_PASS, // Tu contraseña
  },
});

// Función auxiliar para obtener la fecha actual en formato ISO
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Función para convertir fechas al formato ISO
const convertToISODate = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date)) {
    throw new Error(`Fecha inválida: ${dateStr}`);
  }
  return date.toISOString().split("T")[0];
};

// Función auxiliar para actualizar el estado de una reserva
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

// Función auxiliar para marcar una habitación como disponible
const markRoomAsAvailable = async (id_habitacion) => {
  try {
    await query(`UPDATE habitaciones SET estado = 1 WHERE id_habitacion = ?`, [
      id_habitacion,
    ]);
  } catch (error) {
    throw error;
  }
};

// Función auxiliar para marcar una habitación como en mantenimiento
const markRoomAsMaintenance = async (id_habitacion) => {
  try {
    await query(
      `UPDATE habitaciones SET estado = 'en_mantenimiento' WHERE id_habitacion = ?`,
      [id_habitacion]
    );
  } catch (error) {
    throw error;
  }
};

// Función auxiliar para marcar una habitación como en limpieza
const markRoomAsCleaning = async (id_habitacion) => {
  try {
    await query(
      `UPDATE habitaciones SET estado = 'en_limpieza' WHERE id_habitacion = ?`,
      [id_habitacion]
    );
  } catch (error) {
    throw error;
  }
};

// Función para notificar al usuario
const notifyUser = async (id_reserva, message, email) => {
  try {
    const mailOptions = {
      from: "ccolmenaresa@gmail.com",
      to: email,
      subject: "Notificación de Reserva",
      text: message,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

// Función para verificar la disponibilidad de la habitación
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
    console.error(
      "Error al verificar la disponibilidad de la habitación: ",
      err
    );
    res.status(500).render("registro", {
      error: "Error en el servidor",
    });
  }
};

// Lógica principal para actualizar los estados de las reservas
const updateReservationStates = async (today) => {
  const reservations = await query(`SELECT * FROM reservas`);
  const rooms = await query(`SELECT * FROM habitaciones`);

  if (reservations.length === 0) {
    return;
  }

  for (const reservation of reservations) {
    const {
      id_reserva,
      fecha_entrada,
      fecha_salida,
      estado,
      id_habitacion,
      id_cliente,
    } = reservation;
    const entradaDate = convertToISODate(fecha_entrada);
    const salidaDate = convertToISODate(fecha_salida);

    if (estado === "pre-reservada") {
      if (today > entradaDate) {
        await updateReservationStatus(id_reserva, "cancelada");
        await markRoomAsAvailable(id_habitacion);
        await notifyUser(
          id_reserva,
          `Su reserva con ID ${id_reserva} ha sido cancelada porque la fecha de entrada ha pasado.`,
          "correo_del_cliente@example.com"
        );
      } else if (today === entradaDate) {
        await notifyUser(
          id_reserva,
          `La pre-reserva con ID ${id_reserva} vence el día de hoy.`,
          "correo_del_cliente@example.com"
        );
      }
    } else if (estado === "confirmada") {
      if (today >= entradaDate && today <= salidaDate) {
        await updateReservationStatus(id_reserva, "activa");
      }
    } else if (estado === "activa") {
      if (today > salidaDate) {
        await updateReservationStatus(id_reserva, "finalizada");
        await markRoomAsCleaning(id_habitacion); // Marcar como en limpieza
        await notifyUser(
          id_reserva,
          `Su reserva con ID ${id_reserva} ha sido finalizada.`,
          "correo_del_cliente@example.com"
        );
      }
    } else if (estado === "cancelada") {
      await markRoomAsAvailable(id_habitacion);
    } else if (estado === "finalizada") {
      await markRoomAsAvailable(id_habitacion);
    }
  }

  // Verificar estados de habitaciones
  for (const room of rooms) {
    const { id_habitacion, estado } = room;

    if (estado === "en_mantenimiento" || estado === "en_limpieza") {
      continue; // No actualizar si está en mantenimiento o limpieza
    }

    const reservations = await query(
      `SELECT * FROM reservas WHERE id_habitacion = ?`,
      [id_habitacion]
    );

    if (reservations.length === 0) {
      await markRoomAsAvailable(id_habitacion);
    } else {
      for (const reservation of reservations) {
        const {
          fecha_entrada,
          fecha_salida,
          estado: reservaEstado,
        } = reservation;
        const entradaDate = convertToISODate(fecha_entrada);
        const salidaDate = convertToISODate(fecha_salida);

        if (reservaEstado === "pre-reservada" && today > entradaDate) {
          await markRoomAsAvailable(id_habitacion);
        } else if (reservaEstado === "activa" && today > salidaDate) {
          await markRoomAsCleaning(id_habitacion); // Marcar como en limpieza
        }
      }
    }
  }
};

// Middleware para automatizar la actualización de estados
const automatizacionEstados = async (req, res, next) => {
  const today = getCurrentDate();

  try {
    await updateReservationStates(today);
    next();
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).render("checkServerDB", {
        message: "¡Servidor de la Base de Datos NO está activo!",
      });
    }

    res.status(500).render("checkServerDB", {
      message: "Error al conectar con la base de datos.",
    });
  }
};

// Ejecutar el middleware cuando se levanta el servidor
const executeOnServerStart = async () => {
  const today = getCurrentDate();
  console.log(
    JSON.stringify({
      level: "info",
      message: `Middleware ejecutado al iniciar el servidor el día ${today}`,
    })
  );

  try {
    await updateReservationStates(today);
  } catch (error) {
    console.error(
      "Error al verificar y actualizar los estados al iniciar el servidor: ",
      error
    );
  }
};

// Exportar el middleware y la función para ejecutar al iniciar el servidor
module.exports = {
  automatizacionEstados,
  executeOnServerStart,
  updateReservationStates,
  checkRoomAvailability,
};
