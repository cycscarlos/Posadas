// controller.js
const { query } = require("../database/db.js");
const {
  validateAndFormatDatesInRequest,
} = require("../middlewares/dateMiddleware");
const validateClientData = require("../middlewares/validateClientData.js");

// Ruta para actualizar un registro
exports.actualizar = [
  validateAndFormatDatesInRequest,
  async (req, res) => {
    const id_cliente = req.params.id;
    const {
      nombre,
      apellido,
      cedula,
      correo,
      telefono,
      procedencia,
      personas, // Añadir el campo "personas"
      habitacion, // Nueva habitación asignada
      entrada,
      salida,
    } = req.body;

    const error = validateClientData(req.body);
    if (error) {
      return res.status(400).send(error);
    }

    try {
      // Obtener la habitación original asignada al cliente
      const originalReservaResult = await query(
        "SELECT id_habitacion FROM `reservas` WHERE id_cliente = ?",
        [id_cliente]
      );
      const originalHabitacion =
        originalReservaResult.length > 0
          ? originalReservaResult[0].id_habitacion
          : null;

      // Actualizar los datos del cliente en la tabla `clientes`
      await query(
        "UPDATE `clientes` SET nombre = ?, apellido = ?, cedula = ?, correo = ?, telefono = ?, procedencia = ?, personas = ? WHERE id_cliente = ?",
        [
          nombre,
          apellido,
          cedula,
          correo,
          telefono,
          procedencia,
          personas,
          id_cliente,
        ]
      );

      // Actualizar las reservas correspondientes del cliente
      await query(
        "UPDATE `reservas` SET id_habitacion = ?, fecha_entrada = ?, fecha_salida = ? WHERE id_cliente = ?",
        [habitacion, entrada, salida, id_cliente]
      );

      // Actualizar el estado de la habitación original a disponible si es diferente a la nueva
      if (originalHabitacion && originalHabitacion !== habitacion) {
        await query(
          "UPDATE `habitaciones` SET estado = 'disponible' WHERE id_habitacion = ?",
          [originalHabitacion]
        );
      }

      // Actualizar el estado de la nueva habitación a ocupada
      if (habitacion) {
        await query(
          "UPDATE `habitaciones` SET estado = 'ocupada' WHERE id_habitacion = ?",
          [habitacion]
        );
      }

      res.redirect("/consultaGral");
    } catch (err) {
      console.error("Error en la actualización: ", err);
      res.status(500).send("Error en la actualización: " + err.message);
    }
  },
];
