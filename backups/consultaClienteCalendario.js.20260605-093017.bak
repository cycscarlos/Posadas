const express = require("express");
const router = express.Router();
const ctrlConsultaClienteCalendario = require("../controllers/ctrl_consultaClienteCalendario");

// Ruta para consultar al cliente desde el calendario
router.get(
  "/consulta-clienteCalendario/:id:url",
  ctrlConsultaClienteCalendario.consultaClienteCalendario
);

module.exports = router;
