const express = require("express");
const router = express.Router();
const {
  administracionManualEstados,
  updateRoomState,
  updateReservationState,
} = require("../controllers/ctrl_administracionManualEstados");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

// Ruta para renderizar la vista de administración manual de estados
router.get("/administracionManualEstados", administracionManualEstados);

// Ruta para actualizar el estado de una habitación
router.post("/updateRoomState", authenticate, authorize(["admin"]), updateRoomState);

// Ruta para actualizar el estado de una reserva
router.post("/updateReservationState", authenticate, authorize(["admin"]), updateReservationState);

module.exports = router;
