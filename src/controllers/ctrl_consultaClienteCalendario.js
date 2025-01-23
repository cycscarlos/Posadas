const { query } = require("../database/db.js");
const formatFields = require("../middlewares/formatFields.js");

// Función para formatear las fechas
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // Formato dd/mm/aaaa
};

// Ruta para consultar al cliente desde el calendario
exports.consultaClienteCalendario = async (req, res) => {
  const clienteId = req.params.id;

  try {
    // Obtener los datos del cliente
    const clienteResults = await query(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [clienteId]
    );

    if (clienteResults.length > 0) {
      const cliente = clienteResults[0];

      // Obtener las fechas de entrada y salida de la tabla 'reservas'
      const reservasResults = await query(
        "SELECT fecha_entrada, fecha_salida, id_habitacion FROM reservas WHERE id_cliente = ?",
        [cliente.id_cliente]
      );

      if (reservasResults.length > 0) {
        const reserva = reservasResults[0];
        cliente.fecha_entrada = formatDate(reserva.fecha_entrada);
        cliente.fecha_salida = formatDate(reserva.fecha_salida);
        cliente.id_habitacion = reserva.id_habitacion;
      }

      // Formatear cédula y teléfono usando el middleware
      if (cliente.cedula) {
        cliente.cedula = formatFields.formatCedula(cliente.cedula);
      }
      if (cliente.telefono) {
        cliente.telefono = formatFields.formatTelefono(cliente.telefono);
      }

      // Redirigir a la vista con los datos
      res.render("ficha-clienteCalendario", { cliente });
    } else {
      // Cliente no encontrado
      res.render("ficha-clienteCalendario", {
        cliente: null,
        clienteNoExiste: true,
      });
    }
  } catch (error) {
    console.error("Error de base de datos:", error);
    return res.status(500).send("Error de base de datos");
  }
};
