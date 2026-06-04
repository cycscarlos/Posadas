const { query } = require("../database/db.js");
const path = require("path");

exports.consultarDisponibilidad = async (req, res) => {
  const { fechaInicio, fechaFin } = req.body;
  const view = req.query.view;

  if (!fechaInicio || !fechaFin) {
    return res.render("disponibilidadPorFecha", {
      alert: true,
      alertTitle: "Advertencia",
      alertMessage: "Por favor, ingrese ambas fechas.",
      alertIcon: "warning",
      showConfirmButton: true,
      timer: 3000,
      ruta: "disponibilidadPorFecha",
    });
  }

  try {
    const disponibilidad = await query(
      `
                SELECT id_habitacion, tipo_habitacion, capacidad
                FROM habitaciones
                WHERE id_habitacion NOT IN (
                    SELECT id_habitacion
                    FROM reservas
                    WHERE (fecha_entrada < ? AND fecha_salida > ?)
                    AND estado IN ('confirmada', 'activa', 'pre-reservada')
                )
                AND estado = 'disponible'
            `,
      [fechaFin, fechaInicio]
    );

    if (disponibilidad.length === 0) {
      return res.render("disponibilidadPorFechaResultados", {
        alert: true,
        alertTitle: "Sin Disponibilidad",
        alertMessage:
          "No hay habitaciones disponibles en las fechas seleccionadas.",
        alertIcon: "warning",
        fechaInicio,
        fechaFin,
      });
    }

    // CONVERSIÓN DE RowDataPacket A OBJETOS PLANOS (USANDO TU CÓDIGO BASE)
    const disponibilidadPlana = disponibilidad.map((row) => ({ ...row })); // <--- ESTA ES LA LÍNEA CRUCIAL

    // console.log("Datos para la vista (planos):", disponibilidadPlana); // Imprime los datos convertidos

    if (view === "grilla") {
      res.render("disponibilidadPorFechaGrilla", {
        disponibilidad: disponibilidadPlana, // Pasar la versión PLANA
        fechaInicio,
        fechaFin,
      });
    } else {
      res.render("disponibilidadPorFechaResultados", {
        disponibilidad: disponibilidadPlana, // Pasar la versión PLANA
        fechaInicio,
        fechaFin,
      });
    }
  } catch (error) {
    console.error("Error al consultar disponibilidad:", error);
    res.status(500).render("disponibilidadPorFecha", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Error al consultar disponibilidad.",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: "disponibilidadPorFecha",
    });
  }
};
