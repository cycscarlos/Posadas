const express = require("express");
const router = express.Router();
const ctrl_statusReservaciones = require("../controllers/ctrl_statusReservaciones");

// Ruta para renderizar la vista de reservaciones
router.get("/statusReservaciones", ctrl_statusReservaciones.verReservas);

module.exports = router;
