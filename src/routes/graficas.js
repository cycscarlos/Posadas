const express = require("express");
const router = express.Router();
const ctrl_graficas = require("../controllers/ctrl_graficas");

// Ruta para renderizar la vista de Gráficas
router.get("/graficas", ctrl_graficas.graficas);

module.exports = router;
