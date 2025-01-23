const express = require("express");
const router = express.Router();
const ctrl_mapaHabitacionCalendario = require("../controllers/ctrl_mapaHabitacionCalendario");

router.get(
  "/mapaHabitacionCalendario/:id",
  ctrl_mapaHabitacionCalendario.verStatusReservaHabitacion
);

router.get(
  "/cargarFormularioRegistro",
  ctrl_mapaHabitacionCalendario.cargarFormularioRegistro
);
router.get(
  "/consultaFichaModal/:id",
  ctrl_mapaHabitacionCalendario.consultaFichaModal
);

module.exports = router;
