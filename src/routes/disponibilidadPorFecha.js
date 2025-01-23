const express = require("express");
const router = express.Router();
const ctrl_disponibilidad = require("../controllers/ctrl_disponibilidadPorFecha");

router.get("/disponibilidadPorFecha", (req, res) => {
  res.render("disponibilidadPorFecha");
});

router.post(
  "/disponibilidadPorFecha",
  ctrl_disponibilidad.consultarDisponibilidad
);

module.exports = router;
