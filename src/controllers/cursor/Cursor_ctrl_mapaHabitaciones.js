const { query } = require("../../database/db.js");
const { format, isWithinInterval, parseISO } = require("date-fns");

// Constantes para mapeo de estados y colores
const ESTADOS = {
  DISPONIBLE: "disponible",
  OCUPADA: "ocupada",
  PRE_RESERVADA: "pre-reservada",
  MANTENIMIENTO: "mantenimiento",
  FINALIZADA: "finalizada",
  RESERVADA: "reservada",
};

const COLORES = {
  [ESTADOS.DISPONIBLE]: "disponible", // Verde
  [ESTADOS.OCUPADA]: "ocupada", // Rojo
  [ESTADOS.PRE_RESERVADA]: "pre-reservada", // Amarillo
  [ESTADOS.MANTENIMIENTO]: "mantenimiento", // Gris
};

exports.verMapaHabitaciones = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    // Consulta SQL mejorada con formato de fechas estandarizado
    const habitaciones = await query(`
      SELECT
        h.id_habitacion,
        h.tipo_habitacion,
        r.id_reserva,
        r.estado AS reserva_estado,
        DATE_FORMAT(r.fecha_entrada, '%Y-%m-%d') as fecha_entrada,
        DATE_FORMAT(r.fecha_salida, '%Y-%m-%d') as fecha_salida,
        r.id_cliente,
        c.nombre,
        c.apellido
      FROM habitaciones h
      LEFT JOIN reservas r ON h.id_habitacion = r.id_habitacion
      LEFT JOIN clientes c ON r.id_cliente = c.id_cliente
      ORDER BY h.id_habitacion ASC, r.fecha_entrada DESC
    `);

    // Procesamiento de habitaciones
    const habitacionesMap = {};
    habitaciones.forEach((habitacion) => {
      if (
        !habitacionesMap[habitacion.id_habitacion] ||
        (habitacion.fecha_entrada &&
          habitacion.fecha_entrada >
            habitacionesMap[habitacion.id_habitacion].fecha_entrada)
      ) {
        habitacionesMap[habitacion.id_habitacion] = habitacion;
      }
    });

    // Asignación de estados y colores
    const habitacionesConEstado = Object.values(habitacionesMap).map(
      (habitacion) => {
        let estado = ESTADOS.DISPONIBLE;
        let colorClass = COLORES[ESTADOS.DISPONIBLE];

        const fechaEntrada = habitacion.fecha_entrada
          ? parseISO(habitacion.fecha_entrada)
          : null;
        const fechaSalida = habitacion.fecha_salida
          ? parseISO(habitacion.fecha_salida)
          : null;

        // Lógica de estados mejorada
        if (
          habitacion.reserva_estado === ESTADOS.ACTIVA ||
          (habitacion.reserva_estado === ESTADOS.RESERVADA &&
            fechaEntrada &&
            fechaSalida &&
            isWithinInterval(today, { start: fechaEntrada, end: fechaSalida }))
        ) {
          estado = ESTADOS.OCUPADA;
          colorClass = COLORES[ESTADOS.OCUPADA];
        } else if (
          habitacion.reserva_estado === ESTADOS.PRE_RESERVADA &&
          format(fechaEntrada, "yyyy-MM-dd") === todayStr
        ) {
          estado = ESTADOS.PRE_RESERVADA;
          colorClass = COLORES[ESTADOS.PRE_RESERVADA];
        } else if (habitacion.reserva_estado === ESTADOS.MANTENIMIENTO) {
          estado = ESTADOS.MANTENIMIENTO;
          colorClass = COLORES[ESTADOS.MANTENIMIENTO];
        }

        // Información adicional para debugging
        const debugInfo = {
          fechaEntradaOriginal: habitacion.fecha_entrada,
          fechaSalidaOriginal: habitacion.fecha_salida,
          fechaSistema: todayStr,
          estadoOriginal: habitacion.reserva_estado,
          estadoFinal: estado,
        };

        return {
          ...habitacion,
          estado,
          colorClass,
          fechaEntradaFormateada: habitacion.fecha_entrada
            ? format(fechaEntrada, "dd/MM/yyyy")
            : null,
          fechaSalidaFormateada: habitacion.fecha_salida
            ? format(fechaSalida, "dd/MM/yyyy")
            : null,
          debugInfo,
        };
      }
    );

    // Log para debugging
    console.log(
      "Estado actual de habitaciones:",
      habitacionesConEstado.map((h) => ({
        id: h.id_habitacion,
        estado: h.estado,
        colorClass: h.colorClass,
        fechaEntrada: h.fechaEntradaFormateada,
        fechaSistema: todayStr,
        debug: h.debugInfo,
      }))
    );

    res.render("mapaHabitaciones", {
      habitaciones: habitacionesConEstado,
      today: todayStr,
      ESTADOS,
      COLORES,
    });
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).send("Error al cargar el mapa de habitaciones");
  }
};
