const { query, transaction } = require("../database/db.js");

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
    await transaction(async ({ query: q }) => {
      const clienteResult = await q(
        `INSERT INTO clientes (nombre, apellido, cedula, correo, telefono, procedencia, personas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, cedula, correo, telefono, procedencia, personas]
      );

      const cliente_id = clienteResult.insertId;

      const reservaResult = await q(
        `INSERT INTO reservas (id_cliente, id_habitacion, fecha_entrada, fecha_salida, estado)
       VALUES (?, ?, ?, ?, 'pre-reservada')`,
        [cliente_id, habitacion, fecha_entrada, fecha_salida]
      );

      const reserva_id = reservaResult.insertId;

      await q(
        `UPDATE habitaciones SET estado = 'ocupada' WHERE id_habitacion = ?`,
        [habitacion]
      );

      const metodos = metodos_pago.split(",");
      for (let metodo of metodos) {
        const metodoResult = await q(
          `SELECT id_metodo_pago FROM metodos_pago WHERE metodo = ?`,
          [metodo]
        );

        let id_metodo_pago = null;
        if (metodoResult.length > 0) {
          id_metodo_pago = metodoResult[0].id_metodo_pago;
        } else {
          const nuevoMetodoResult = await q(
            `INSERT INTO metodos_pago (metodo) VALUES (?)`,
            [metodo]
          );
          id_metodo_pago = nuevoMetodoResult.insertId;
        }

        await q(
          `INSERT INTO pagos (id_reserva, id_metodo_pago, monto, fecha_pago, id_cliente)
         VALUES (?, ?, ?, ?, ?)`,
          [reserva_id, id_metodo_pago, monto, fecha_transaccion, cliente_id]
        );
      }
    });

    res.redirect(`/preReservaciones?success=true`);
  } catch (error) {
    console.error("Error en la consulta SQL: ", error);
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
    await transaction(async ({ query: q }) => {
      await q(
        `UPDATE clientes
       SET nombre = ?, apellido = ?, cedula = ?, correo = ?, telefono = ?, procedencia = ?, personas = ?
       WHERE id_cliente = (SELECT id_cliente FROM reservas WHERE id_reserva = ?)`,
        [nombre, apellido, cedula, correo, telefono, procedencia, personas, id]
      );

      await q(
        `UPDATE reservas
       SET id_habitacion = ?, fecha_entrada = ?, fecha_salida = ?
       WHERE id_reserva = ? AND estado = 'pre-reservada'`,
        [habitacion, fecha_entrada, fecha_salida, id]
      );

      await q(
        `UPDATE habitaciones SET estado = 'ocupada' WHERE id_habitacion = ?`,
        [habitacion]
      );

      await q(`DELETE FROM pagos WHERE id_reserva = ?`, [id]);

      const clienteResult = await q(
        `SELECT id_cliente FROM reservas WHERE id_reserva = ?`,
        [id]
      );
      const cliente_id =
        clienteResult.length > 0 ? clienteResult[0].id_cliente : null;

      const metodos = metodos_pago.split(",");
      for (let metodo of metodos) {
        const metodoResult = await q(
          `SELECT id_metodo_pago FROM metodos_pago WHERE metodo = ?`,
          [metodo]
        );

        let id_metodo_pago = null;
        if (metodoResult.length > 0) {
          id_metodo_pago = metodoResult[0].id_metodo_pago;
        } else {
          const nuevoMetodoResult = await q(
            `INSERT INTO metodos_pago (metodo) VALUES (?)`,
            [metodo]
          );
          id_metodo_pago = nuevoMetodoResult.insertId;
        }

        await q(
          `INSERT INTO pagos (id_reserva, id_metodo_pago, monto, fecha_pago, id_cliente)
         VALUES (?, ?, ?, ?, ?)`,
          [id, id_metodo_pago, monto, fecha_transaccion, cliente_id]
        );
      }
    });

    res.redirect(`/preReservaciones?success=true`);
  } catch (error) {
    console.error("Error en la consulta SQL: ", error);
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
    await transaction(async ({ query: q }) => {
      const reservaResult = await q(
        `SELECT id_habitacion FROM reservas WHERE id_reserva = ? AND estado = 'pre-reservada'`,
        [id]
      );

      const habitacion =
        reservaResult.length > 0 ? reservaResult[0].id_habitacion : null;

      await q(`DELETE FROM pagos WHERE id_reserva = ?`, [id]);

      await q(
        `DELETE FROM reservas WHERE id_reserva = ? AND estado = 'pre-reservada'`,
        [id]
      );

      if (habitacion) {
        await q(
          `UPDATE habitaciones SET estado = 'disponible' WHERE id_habitacion = ?`,
          [habitacion]
        );
      }
    });

    res.redirect(`/preReservaciones?success=true`);
  } catch (error) {
    console.error("Error en la consulta SQL: ", error);
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
