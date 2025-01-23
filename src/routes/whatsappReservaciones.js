const express = require("express");
const router = express.Router();
const ctrl_whatsappReservaciones = require("../controllers/ctrl_whatsappReservaciones");

// Ruta para mostrar el formulario de reservaciones a través de WhatsApp
router.get(
  "/whatsapp-reservaciones",
  ctrl_whatsappReservaciones.mostrarFormularioReservas
);

// Ruta para reservar habitación a través de WhatsApp
router.post(
  "/whatsapp-reservaciones",
  ctrl_whatsappReservaciones.reservarHabitacion
);

module.exports = router;
