const { query } = require("../database/db.js");


// Función para mostrar la vista de pagos
exports.mostrarPagos = async (req, res) => {
  const { id } = req.query;

  try {
    // Obtener los datos del cliente
    let clienteResult = await query(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [id]
    );

    if (clienteResult.length === 0) {
      clienteResult = await query("SELECT * FROM clientes WHERE cedula = ?", [
        id,
      ]);
    }

    if (clienteResult.length === 0) {
      clienteResult = await query(
        "SELECT c.* FROM clientes c JOIN reservas r ON c.id_cliente = r.id_cliente WHERE r.id_reserva = ?",
        [id]
      );
    }

    if (clienteResult.length === 0) {
      return res.render("consulta-pagos", {
        cliente: null,
        error: "Cliente no encontrado.",
      });
    }

    const cliente = clienteResult[0];

    // Obtener los pagos del cliente
    const pagosResult = await query(
      "SELECT p.monto, p.fecha_pago, mp.metodo FROM pagos p JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago WHERE p.id_cliente = ?",
      [cliente.id_cliente]
    );

    cliente.pagos = pagosResult;

    // Renderizar la vista con los datos del cliente y sus pagos
    res.render("pagos", { cliente });
  } catch (err) {
    console.error("Error al obtener los datos del cliente: ", err);
    res.status(500).send("Error al obtener los datos del cliente.");
  }
};
