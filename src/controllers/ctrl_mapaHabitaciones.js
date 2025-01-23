const { query } = require("../database/db.js");

exports.verMapaHabitaciones = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const habitaciones = await query(`
      SELECT
        h.id_habitacion,
        h.tipo_habitacion,
        r.id_reserva,
        r.estado AS reserva_estado,
        DATE(r.fecha_entrada) as fecha_entrada,
        DATE(r.fecha_salida) as fecha_salida
      FROM
        habitaciones h
      LEFT JOIN
        reservas r ON h.id_habitacion = r.id_habitacion
      ORDER BY
        h.id_habitacion ASC, r.fecha_entrada DESC;
    `);

    const habitacionesMap = {};
    habitaciones.forEach((habitacion) => {
      if (!habitacionesMap[habitacion.id_habitacion]) {
        habitacionesMap[habitacion.id_habitacion] = habitacion;
      } else {
        const existingReserva = habitacionesMap[habitacion.id_habitacion];
        if (habitacion.fecha_entrada > existingReserva.fecha_entrada) {
          habitacionesMap[habitacion.id_habitacion] = habitacion;
        }
      }
    });

    const habitacionesConEstado = Object.values(habitacionesMap).map(
      (habitacion) => {
        let colorClass = "disponible";

        // Formatear fecha_entrada y fecha_salida para comparación
        const fechaEntrada = habitacion.fecha_entrada
          ? new Date(habitacion.fecha_entrada).toISOString().split("T")[0]
          : null;
        const fechaSalida = habitacion.fecha_salida
          ? new Date(habitacion.fecha_salida).toISOString().split("T")[0]
          : null;

        // console.log("Fecha actual:", today);
        // console.log("Fecha de entrada:", fechaEntrada);
        // console.log("Fecha de salida:", fechaSalida);
        // console.log("Estado de la reserva:", habitacion.reserva_estado);

        if (habitacion.reserva_estado === "pre-reservada") {
          console.log("Habitación pre-reservada:", {
            id: habitacion.id_habitacion,
            fechaEntrada: fechaEntrada,
            fechaSistema: today,
            estado: habitacion.reserva_estado,
          });
        }

        if (
          habitacion.reserva_estado === "activa" ||
          (habitacion.reserva_estado === "reservada" &&
            today >= fechaEntrada &&
            today <= fechaSalida)
        ) {
          colorClass = "ocupada";
        } else if (habitacion.reserva_estado === "pre-reservada") {
          if (today === fechaEntrada) {
            colorClass = "pre-reservada"; // Amarillo el día de la pre-reserva
          } else if (today < fechaEntrada) {
            colorClass = "disponible"; // Verde antes del día de la pre-reserva
          } else {
            colorClass = "ocupada"; // Rojo después del día de la pre-reserva
          }
        } else if (habitacion.reserva_estado === "mantenimiento") {
          colorClass = "mantenimiento";
        } else if (
          habitacion.reserva_estado === "finalizada" ||
          habitacion.reserva_estado === "disponible" ||
          (habitacion.reserva_estado === "reservada" && fechaEntrada > today)
        ) {
          colorClass = "disponible";
        }

        return {
          ...habitacion,
          colorClass,
        };
      }
    );

    res.render("mapaHabitaciones", {
      habitaciones: habitacionesConEstado,
      today,
    });
  } catch (error) {
    console.error("Error al obtener habitaciones: ", error);
    res.status(500).send("Error al cargar el mapa de habitaciones.");
  }
};
