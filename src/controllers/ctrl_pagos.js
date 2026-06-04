const { query } = require("../database/db.js");
const {
  formatCedula,
  formatTelefono,
} = require("../middlewares/formatFields.js");

// Función para formatear las fechas
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // Formato dd/mm/aaaa
};

// Función para agregar un nuevo pago a un cliente existente
exports.agregarPago = async (req, res) => {
  const { id } = req.params;
  const { monto, fecha_transaccion, metodos_pago } = req.body;

  try {
    // Verificar si el cliente existe
    const clienteResult = await query(
      "SELECT * FROM clientes WHERE id_cliente = ? OR cedula = ?",
      [id, id]
    );
    if (clienteResult.length === 0) {
      return res.status(404).send("Cliente no encontrado.");
    }

    const id_cliente = clienteResult[0].id_cliente;

    // Verificar si el cliente tiene una reserva activa
    const reservaResult = await query(
      "SELECT * FROM reservas WHERE id_cliente = ? AND estado IN ('reservada', 'activa')",
      [id_cliente]
    );

    let id_reserva = null;
    if (reservaResult.length > 0) {
      id_reserva = reservaResult[0].id_reserva;
    }

    // Insertar datos en la tabla `pagos`
    const metodos = metodos_pago.split(",");
    for (let metodo of metodos) {
      // Verificar si el método de pago existe en la tabla `metodos_pago`
      const metodoResult = await query(
        "SELECT id_metodo_pago FROM metodos_pago WHERE metodo = ?",
        [metodo]
      );

      let id_metodo_pago = null;
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

      await query(
        "INSERT INTO pagos (id_reserva, id_metodo_pago, monto, fecha_pago, id_cliente) VALUES (?, ?, ?, ?, ?)",
        [id_reserva, id_metodo_pago, monto, fecha_transaccion, id_cliente]
      );
    }

    // Redirigir con mensaje de éxito
    res.redirect(`/pagos?id=${id_cliente}&success=true`);
  } catch (err) {
    console.error("Error al agregar el pago: ", err);
    res.status(500).send("Error al agregar el pago.");
  }
};

exports.mostrarPagos = async (req, res) => {
  const { id } = req.query;

  try {
    // Consulta modificada para incluir información de reservas
    const clienteQuery = `
      SELECT 
        c.*,
        r.id_habitacion,
        r.fecha_entrada,
        r.fecha_salida,
        r.estado as estado_reserva,
        p.monto,
        p.fecha_pago,
        mp.metodo
      FROM clientes c
      LEFT JOIN reservas r ON c.id_cliente = r.id_cliente
      LEFT JOIN pagos p ON (p.id_cliente = c.id_cliente OR p.id_reserva = r.id_reserva)
      LEFT JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
      WHERE c.id_cliente = ? OR c.cedula = ? OR r.id_reserva = ?
      ORDER BY p.fecha_pago DESC`;

    const clienteResult = await query(clienteQuery, [id, id, id]);

    if (clienteResult.length === 0) {
      return res.render("pagos", {
        cliente: null,
        error: "Cliente no encontrado.",
      });
    }

    // Procesar los datos del cliente con formateo de campos
    const cliente = {
      ...clienteResult[0],
      cedula: formatCedula(clienteResult[0].cedula),
      telefono: formatTelefono(clienteResult[0].telefono),
      fecha_entrada: clienteResult[0].fecha_entrada
        ? formatDate(clienteResult[0].fecha_entrada)
        : null,
      fecha_salida: clienteResult[0].fecha_salida
        ? formatDate(clienteResult[0].fecha_salida)
        : null,
    };

    // Obtener los pagos del cliente
    const pagosQuery = `
      SELECT 
        p.monto,
        p.fecha_pago,
        mp.metodo,
        r.id_habitacion,
        r.fecha_entrada,
        r.fecha_salida
      FROM pagos p
      JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
      LEFT JOIN reservas r ON p.id_reserva = r.id_reserva
      WHERE p.id_cliente = ?
      ORDER BY p.fecha_pago DESC`;

    const pagosResult = await query(pagosQuery, [cliente.id_cliente]);

    // Procesar los pagos
    cliente.pagos = pagosResult.map((pago) => ({
      monto: pago.monto,
      fecha_pago: formatDate(pago.fecha_pago),
      metodo: pago.metodo,
      id_habitacion: pago.id_habitacion,
      fecha_entrada: pago.fecha_entrada ? formatDate(pago.fecha_entrada) : null,
      fecha_salida: pago.fecha_salida ? formatDate(pago.fecha_salida) : null,
    }));

    // Si hay pagos, usar el más reciente como pago actual
    if (cliente.pagos.length > 0) {
      const ultimoPago = cliente.pagos[0];
      cliente.fecha_pago = ultimoPago.fecha_pago;
      cliente.monto = ultimoPago.monto;
      cliente.metodo = ultimoPago.metodo;
    }

    // Renderizar la vista con los datos del cliente y sus pagos
    res.render("pagos", { cliente });
  } catch (err) {
    console.error("Error al obtener los datos del cliente: ", err);
    res.status(500).send("Error al obtener los datos del cliente.");
  }
};
