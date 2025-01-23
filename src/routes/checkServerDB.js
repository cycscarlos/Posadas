const express = require("express");
const router = express.Router();
const { query } = require("../database/db");

router.get("/", async (req, res) => {
  try {
    await query("SELECT 1");
    return res.redirect("/home"); // Redirige a /home si la conexión es exitosa
  } catch (error) {
    console.error("Error al conectar a la base de datos en /:", error);
    res
      .status(500)
      .render("checkServerDB", {
        message:
          "Error al conectar con la base de datos. Por favor, verifica que el servidor de la base de datos esté activo.",
      });
  }
});

module.exports = router;
