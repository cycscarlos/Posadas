const express = require("express");
const router = express.Router();
const ctrl_consultaPagos = require("../controllers/ctrl_consultaPagos");


// Ruta para mostrar la vista de consulta de pagos
router.get("/consulta-pagos", ctrl_consultaPagos.mostrarPagos);

module.exports = router;
