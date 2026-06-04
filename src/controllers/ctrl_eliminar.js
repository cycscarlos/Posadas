const { query } = require("../database/db.js");
const path = require("path");

// Ruta para eliminar un registro
exports.eliminar = async (req, res) => {
  const id_cliente = req.params.id;
  try {
    // Obtener la habitación asignada al cliente
    const result = await query(
      "SELECT id_habitacion FROM `reservas` WHERE id_cliente = ?",
      [id_cliente]
    );
    const id_habitacion = result.length > 0 ? result[0].id_habitacion : null;

    // Eliminar el registro de la tabla `reservas`
    await query("DELETE FROM `reservas` WHERE id_cliente = ?", [id_cliente]);

    // Eliminar el registro de la tabla `clientes`
    await query("DELETE FROM `clientes` WHERE id_cliente = ?", [id_cliente]);

    // Actualizar el estado de la habitación a disponible
    if (id_habitacion) {
      await query(
        "UPDATE `habitaciones` SET estado = 'disponible' WHERE id_habitacion = ?",
        [id_habitacion]
      );
    }

    res.redirect("/consultaGral");
  } catch (err) {
    console.error("Error al eliminar el registro: ", err);
    res.status(500).send("Error al eliminar el registro: " + err.message);
  }
};
