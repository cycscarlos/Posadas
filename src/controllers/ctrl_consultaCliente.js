const { query } = require("../database/db.js");
const formatFields = require("../middlewares/formatFields.js");

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

exports.consultaCliente = async (req, res) => {
  const cedula = req.body.cedula;

  if (!cedula || cedula.trim() === '') {
    return res.status(400).send("Número de cédula es inválido");
  }

  try {
    // Consulta principal con JOIN a metodos_pago
    const clienteResults = await query(
      `SELECT c.*, r.fecha_entrada, r.fecha_salida, r.id_habitacion, 
              r.estado as estado_reserva, 
              p.monto, p.fecha_pago, mp.metodo
       FROM clientes c
       LEFT JOIN reservas r ON c.id_cliente = r.id_cliente
       LEFT JOIN pagos p ON r.id_reserva = p.id_reserva
       LEFT JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
       WHERE c.cedula = ?`,
      [cedula.trim()]
    );

    if (clienteResults.length > 0) {
      const cliente = clienteResults[0];

      // Formatear fechas
      if (cliente.fecha_entrada) {
        cliente.fecha_entrada = formatDate(cliente.fecha_entrada);
      }
      if (cliente.fecha_salida) {
        cliente.fecha_salida = formatDate(cliente.fecha_salida);
      }
      if (cliente.fecha_pago) {
        cliente.fecha_pago = formatDate(cliente.fecha_pago);
      }

      // Formatear cédula y teléfono
      if (cliente.cedula) {
        cliente.cedula = formatFields.formatCedula(cliente.cedula);
      }
      if (cliente.telefono) {
        cliente.telefono = formatFields.formatTelefono(cliente.telefono);
      }

      // Obtener historial completo de pagos
      const pagosResults = await query(
        `SELECT p.monto, p.fecha_pago, mp.metodo
         FROM pagos p 
         JOIN reservas r ON p.id_reserva = r.id_reserva 
         JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
         WHERE r.id_cliente = ?
         ORDER BY p.fecha_pago DESC`,
        [cliente.id_cliente]
      );

      // Formatear fechas de pagos y asignar al cliente
      if (pagosResults.length > 0) {
        cliente.pagos = pagosResults.map((pago) => ({
          ...pago,
          fecha_pago: formatDate(pago.fecha_pago),
        }));
      }

      res.render("ficha-cliente", { cliente });
    } else {
      res.render("ficha-cliente", {
        cliente: null,
        clienteNoExiste: true,
      });
    }
  } catch (error) {
    console.error("Error de base de datos:", error);
    return res.status(500).send("Error de base de datos");
  }
};
