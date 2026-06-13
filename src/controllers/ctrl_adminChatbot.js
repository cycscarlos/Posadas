const { query } = require("../database/db");

const getAdminChatbot = async (req, res) => {
  try {
    const habitaciones = await query(
      "SELECT id_habitacion, tipo_habitacion, capacidad, precio FROM habitaciones ORDER BY id_habitacion"
    );
    const promociones = await query(
      "SELECT id_promocion, titulo, descripcion, fecha_inicio, fecha_fin, activo FROM promociones ORDER BY id_promocion DESC"
    );
    res.render("adminChatbot", {
      habitaciones,
      promociones,
      csrfToken: req.session.csrfToken,
    });
  } catch (err) {
    console.error("Error en getAdminChatbot:", err);
    req.flash("error", "Error al cargar la página.");
    res.redirect("/menu");
  }
};

const updatePrecio = async (req, res) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;
    if (precio === undefined || precio === null || precio === "") {
      return res.json({ success: false, message: "El precio es requerido." });
    }
    const parsed = parseFloat(precio);
    if (isNaN(parsed) || parsed < 0) {
      return res.json({ success: false, message: "Precio inválido." });
    }
    await query("UPDATE habitaciones SET precio = ? WHERE id_habitacion = ?", [
      parsed,
      id,
    ]);
    res.json({ success: true, message: "Precio actualizado correctamente." });
  } catch (err) {
    console.error("Error en updatePrecio:", err);
    res
      .status(500)
      .json({ success: false, message: "Error al actualizar el precio." });
  }
};

const addPromocion = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_inicio, fecha_fin, activo } = req.body;
    if (!titulo || titulo.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "El título es requerido." });
    }
    await query(
      "INSERT INTO promociones (titulo, descripcion, fecha_inicio, fecha_fin, activo) VALUES (?, ?, ?, ?, ?)",
      [
        titulo.trim(),
        descripcion?.trim() || null,
        fecha_inicio || null,
        fecha_fin || null,
        activo !== undefined ? (activo ? 1 : 0) : 1,
      ]
    );
    res
      .status(201)
      .json({ success: true, message: "Promoción agregada correctamente." });
  } catch (err) {
    console.error("Error en addPromocion:", err);
    res
      .status(500)
      .json({ success: false, message: "Error al agregar la promoción." });
  }
};

const deletePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM promociones WHERE id_promocion = ?", [id]);
    res.json({ success: true, message: "Promoción eliminada correctamente." });
  } catch (err) {
    console.error("Error en deletePromocion:", err);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar la promoción." });
  }
};

module.exports = {
  getAdminChatbot,
  updatePrecio,
  addPromocion,
  deletePromocion,
};
