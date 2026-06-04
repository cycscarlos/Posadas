const { transaction } = require("../database/db.js");
const path = require("path");

// Ruta para eliminar un registro
exports.eliminar = async (req, res) => {
  const id_cliente = req.params.id;
  try {
    await transaction(async ({ query: q }) => {
      const result = await q(
        "SELECT id_habitacion FROM `reservas` WHERE id_cliente = ?",
        [id_cliente]
      );
      const id_habitacion = result.length > 0 ? result[0].id_habitacion : null;

      await q("DELETE FROM `reservas` WHERE id_cliente = ?", [id_cliente]);

      await q("DELETE FROM `clientes` WHERE id_cliente = ?", [id_cliente]);

      if (id_habitacion) {
        await q(
          "UPDATE `habitaciones` SET estado = 'disponible' WHERE id_habitacion = ?",
          [id_habitacion]
        );
      }
    });

    res.redirect("/consultaGral");
  } catch (err) {
    console.error("Error al eliminar el registro: ", err);
    res.status(500).send("Error al eliminar el registro: " + err.message);
  }
};
