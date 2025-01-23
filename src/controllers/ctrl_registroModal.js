const { query } = require("../database/db.js");
const {
  validateAndFormatDatesInRequest,
} = require("../middlewares/dateMiddleware");
const validateClientData = require("../middlewares/validateClientData.js");
const checkRoomAvailability = require("../middlewares/checkRoomAvailability.js");

// Ruta para registrar un nuevo cliente desde el modal
exports.registroClienteModal = [
  validateAndFormatDatesInRequest,
  checkRoomAvailability,
  async (req, res) => {
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
      monto,
      fecha_transaccion,
      metodos_pago,
    } = req.body;

    const error = validateClientData(req.body);

    if (error) {
      return res.redirect(
        `/historialHabitaciones?error=${encodeURIComponent(error)}`
      );
    }

    try {
      // Insertar datos del cliente en la tabla 'clientes'
      const result = await query("INSERT INTO clientes SET ?", {
        cedula,
        nombre,
        apellido,
        telefono,
        correo,
        procedencia,
        personas,
      });

      const id_cliente = result.insertId;

      // Insertar datos de la reservación en la tabla 'reservas'
      const reservaResult = await query("INSERT INTO reservas SET ?", {
        id_cliente,
        id_habitacion: habitacion,
        fecha_entrada: entrada,
        fecha_salida: salida,
        estado: "reservada", // Estado inicial de la reservación
      });

      const id_reserva = reservaResult.insertId; // Obtener el id de la reserva recién creada

      // Obtener la fecha del sistema
      const currentDate = new Date().toISOString().split("T")[0];

      // Comparar la fecha de entrada con la fecha del sistema
      if (entrada === currentDate) {
        // Actualizar el estado de la reservación a 'activa'
        await query(
          "UPDATE reservas SET estado = 'activa' WHERE id_reserva = ?",
          [id_reserva]
        );

        // Actualizar el estado de la habitación a 0 (ocupada)
        await query(
          "UPDATE habitaciones SET estado = 0 WHERE id_habitacion = ?",
          [habitacion]
        );
      }

      // Insertar datos en la tabla `pagos` y `metodos_pago`
      const metodos = Array.isArray(metodos_pago)
        ? metodos_pago
        : [metodos_pago]; // Asegurarse de que sea un array
      for (const metodo of metodos) {
        // Verificar si el método de pago existe en la tabla `metodos_pago`
        const metodoResult = await query(
          "SELECT id_metodo_pago FROM metodos_pago WHERE metodo = ?",
          [metodo]
        );

        let id_metodo_pago;
        if (metodoResult.length > 0) {
          id_metodo_pago = metodoResult[0].id_metodo_pago;
        } else {
          // Insertar el nuevo método de pago en la tabla `metodos_pago`
          const nuevoMetodoResult = await query(
            "INSERT INTO metodos_pago (metodo) VALUES (?)",
            [metodo]
          );
          id_metodo_pago = nuevoMetodoResult.insertId;
        }

        // Insertar el pago en la tabla `pagos`
        await query(
          "INSERT INTO pagos (id_reserva, id_metodo_pago, monto, fecha_pago, id_cliente) VALUES (?, ?, ?, ?, ?)",
          [id_reserva, id_metodo_pago, monto, fecha_transaccion, id_cliente]
        );
      }

      // Redirigir con mensaje de éxito
      res.redirect(`/registro-modal?success=true`);
    } catch (err) {
      console.error("Error al guardar el cliente: ", err);
      res.redirect(`/registro-modal?error=${encodeURIComponent(err.message)}`);
    }
  },
];
