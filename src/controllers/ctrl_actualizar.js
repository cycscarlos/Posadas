// controller.js
const { query, transaction } = require("../database/db.js");
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
      personas,
      habitacion,
      entrada,
      salida,
    } = req.body;

    const error = validateClientData(req.body);
    if (error) {
      return res.status(400).send(error);
    }

    try {
      const originalReservaResult = await query(
        "SELECT id_habitacion FROM `reservas` WHERE id_cliente = ?",
        [id_cliente]
      );
      const originalHabitacion =
        originalReservaResult.length > 0
          ? originalReservaResult[0].id_habitacion
          : null;

      await transaction(async ({ query: q }) => {
        await q(
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

        await q(
          "UPDATE `reservas` SET id_habitacion = ?, fecha_entrada = ?, fecha_salida = ? WHERE id_cliente = ?",
          [habitacion, entrada, salida, id_cliente]
        );

        if (originalHabitacion && originalHabitacion !== habitacion) {
          await q(
            "UPDATE `habitaciones` SET estado = 'disponible' WHERE id_habitacion = ?",
            [originalHabitacion]
          );
        }

        if (habitacion) {
          await q(
            "UPDATE `habitaciones` SET estado = 'ocupada' WHERE id_habitacion = ?",
            [habitacion]
          );
        }
      });

      res.redirect("/consultaGral");
    } catch (err) {
      console.error("Error en la actualización: ", err);
      res.status(500).send("Error en la actualización: " + err.message);
    }
  },
];
