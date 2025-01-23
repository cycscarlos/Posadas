const express = require("express");
const router = express.Router();

const ctrl_mapaHabitaciones = require("../controllers/ctrl_mapaHabitaciones");

// Ruta para mostrar la vista principal de la aplicación
router.get("/mapaHabitaciones", ctrl_mapaHabitaciones.verMapaHabitaciones);

module.exports = router;
