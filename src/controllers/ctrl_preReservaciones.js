const { query } = require("../database/db.js");

// Obtener todas las pre-reservaciones
const getAllPreReservaciones = async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM reservas
      WHERE estado = 'pre-reservada'
    `);
    res.render("preReservaciones", {
      reservas: result,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error en la consulta SQL: ", error);
    res.render("preReservaciones", { error: "Error al cargar las reservas." });
  }
};


const createPreReservacion = async (req, res) => {
  const {
    nombre,
    apellido,
    cedula,
    correo,
    telefono,
    procedencia,
    personas,
    habitacion,
    fecha_entrada,
    fecha_salida,
    monto,
    fecha_transaccion,
    metodos_pago,
  } = req.body;

  try {
    // Insertar datos en la tabla `clientes`
    const clienteResult = await query(
      `
      INSERT INTO clientes (nombre, apellido, cedula, correo, telefono, procedencia, personas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [nombre, apellido, cedula, correo, telefono, procedencia, personas]
    );

    const cliente_id = clienteResult.insertId;

    // Insertar datos en la tabla `reservas` como pre-reservación
    const reservaResult = await query(
      `
      INSERT INTO reservas (id_cliente, id_habitacion, fecha_entrada, fecha_salida, estado)
      VALUES (?, ?, ?, ?, 'pre-reservada')
    `,
      [cliente_id, habitacion, fecha_entrada, fecha_salida]
    );

    const reserva_id = reservaResult.insertId;

    // Actualizar el estado en la tabla `habitaciones`
    await query(
      `
      UPDATE habitaciones
      SET estado = 0
      WHERE id_habitacion = ?
    `,
      [habitacion]
    );

    // Insertar datos en la tabla `pagos`
    const metodos = metodos_pago.split(",");
    for (let metodo of metodos) {
      // Verificar si el método de pago existe en la tabla `metodos_pago`
      const metodoResult = await query(
        `
        SELECT id_metodo_pago FROM metodos_pago WHERE metodo = ?
      `,
        [metodo]
      );

      let id_metodo_pago = null;
      if (metodoResult.length > 0) {
        id_metodo_pago = metodoResult[0].id_metodo_pago;
      } else {
        // Insertar el nuevo método de pago en la tabla `metodos_pago`
        const nuevoMetodoResult = await query(
          `
          INSERT INTO metodos_pago (metodo)
          VALUES (?)
        `,
          [metodo]
        );
        id_metodo_pago = nuevoMetodoResult.insertId;
      }

      await query(
        `
        INSERT INTO pagos (id_reserva, id_metodo_pago, monto, fecha_pago, id_cliente)
        VALUES (?, ?, ?, ?, ?)
      `,
        [reserva_id, id_metodo_pago, monto, fecha_transaccion, cliente_id]
      );
    }

    // Redirigir y enviar mensaje de éxito
    res.redirect(`/preReservaciones?success=true`);
  } catch (error) {
    console.error("Error en la consulta SQL: ", error);
    // Redirigir y enviar mensaje de error
    res.redirect(
      `/preReservaciones?error=${encodeURIComponent(
        "Error al crear la pre-reservación."
      )}`
    );
  }
};


const updatePreReservacion = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    cedula,
    correo,
    telefono,
    procedencia,
    personas,
    habitacion,
    fecha_entrada,
    fecha_salida,
    monto,
    fecha_transaccion,
    metodos_pago,
  } = req.body;

  try {
    // Actualizar datos en la tabla `clientes`
    await query(
      `
      UPDATE clientes
      SET nombre = ?, apellido = ?, cedula = ?, correo = ?, telefono = ?, procedencia = ?, personas = ?
      WHERE id_cliente = (SELECT id_cliente FROM reservas WHERE id_reserva = ?)
    `,
      [nombre, apellido, cedula, correo, telefono, procedencia, personas, id]
    );

    // Actualizar datos en la tabla `reservas`
    await query(
      `
      UPDATE reservas
      SET id_habitacion = ?, fecha_entrada = ?, fecha_salida = ?
      WHERE id_reserva = ? AND estado = 'pre-reservada'
    `,
      [habitacion, fecha_entrada, fecha_salida, id]
    );

    // Actualizar el estado en la tabla `habitaciones`
    await query(
      `
      UPDATE habitaciones
      SET estado = 0
      WHERE id_habitacion = ?
    `,
      [habitacion]
    );

    // Actualizar datos en la tabla `pagos`
    await query(`DELETE FROM pagos WHERE id_reserva = ?`, [id]);

    const clienteResult = await query(
      `SELECT id_cliente FROM reservas WHERE id_reserva = ?`,
      [id]
    );
    const cliente_id =
      clienteResult.length > 0 ? clienteResult[0].id_cliente : null;

    const metodos = metodos_pago.split(",");
    for (let metodo of metodos) {
      // Verificar si el método de pago existe en la tabla `metodos_pago`
      const metodoResult = await query(
        `SELECT id_metodo_pago FROM metodos_pago WHERE metodo = ?`,
        [metodo]
      );

      let id_metodo_pago = null;
      if (metodoResult.length > 0) {
        id_metodo_pago = metodoResult[0].id_metodo_pago;
      } else {
        // Insertar el nuevo método de pago en la tabla `metodos_pago`
        const nuevoMetodoResult = await query(
          `
          INSERT INTO metodos_pago (metodo)
          VALUES (?)
        `,
          [metodo]
        );
        id_metodo_pago = nuevoMetodoResult.insertId;
      }

      await query(
        `
        INSERT INTO pagos (id_reserva, id_metodo_pago, monto, fecha_pago, id_cliente)
        VALUES (?, ?, ?, ?, ?)
      `,
        [id, id_metodo_pago, monto, fecha_transaccion, cliente_id]
      );
    }

    // Redirigir y enviar mensaje de éxito
    res.redirect(`/preReservaciones?success=true`);
  } catch (error) {
    console.error("Error en la consulta SQL: ", error);
    // Redirigir y enviar mensaje de error
    res.redirect(
      `/preReservaciones?error=${encodeURIComponent(
        "Error al actualizar la pre-reservación."
      )}`
    );
  }
};

// Eliminar una pre-reservación
const deletePreReservacion = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener el ID de la habitación antes de eliminar la reserva
    const reservaResult = await query(
      `SELECT id_habitacion FROM reservas WHERE id_reserva = ? AND estado = 'pre-reservada'`,
      [id]
    );

    const habitacion =
      reservaResult.length > 0 ? reservaResult[0].id_habitacion : null;

    await query(
      `
      DELETE FROM pagos WHERE id_reserva = ?
    `,
      [id]
    );

    await query(
      `
      DELETE FROM reservas WHERE id_reserva = ? AND estado = 'pre-reservada'
    `,
      [id]
    );

    // Actualizar el estado en la tabla `habitaciones` a disponible
    if (habitacion) {
      await query(
        `
        UPDATE habitaciones
        SET estado = 1
        WHERE id_habitacion = ?
      `,
        [habitacion]
      );
    }

    // Redirigir y enviar mensaje de éxito
    res.redirect(`/preReservaciones?success=true`);
  } catch (error) {
    console.error("Error en la consulta SQL: ", error);
    // Redirigir y enviar mensaje de error
    res.redirect(
      `/preReservaciones?error=${encodeURIComponent(
        "Error al eliminar la pre-reservación."
      )}`
    );
  }
};

// Exportar las funciones
module.exports = {
  getAllPreReservaciones,
  createPreReservacion,
  updatePreReservacion,
  deletePreReservacion,
};
