const { query } = require("../database/db.js");
const path = require("path");

// Ruta para editar un registro
exports.editar = async (req, res) => {
  const id_cliente = req.params.id;
  try {
    // Consulta para obtener los datos del cliente junto con las reservas correspondientes
    const results = await query(
      `
        SELECT c.id_cliente, c.cedula, c.nombre, c.apellido, c.telefono, c.correo, c.procedencia, c.personas,
               r.fecha_entrada, r.fecha_salida, r.id_habitacion
        FROM clientes c
        LEFT JOIN reservas r ON c.id_cliente = r.id_cliente
        WHERE c.id_cliente = ?
      `,
      [id_cliente]
    );

    if (results.length > 0) {
      const user = results[0];

      // Formatear las fechas de entrada y salida
      user.fecha_entrada = user.fecha_entrada
        ? new Date(user.fecha_entrada).toISOString().split("T")[0]
        : null;
      user.fecha_salida = user.fecha_salida
        ? new Date(user.fecha_salida).toISOString().split("T")[0]
        : null;

      res.render("editar", { user });
    } else {
      res.status(404).send("Registro no encontrado.");
    }
  } catch (err) {
    console.error("Error al obtener el registro: ", err);
    res.status(500).send("Error al obtener el registro: " + err.message);
  }
};
