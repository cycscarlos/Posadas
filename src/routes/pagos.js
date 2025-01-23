const express = require("express");
const router = express.Router();
const ctrl_pagos = require("../controllers/ctrl_pagos");

// Ruta para agregar un nuevo pago a un cliente existente
router.post("/pagos/:id/agregar-pago", ctrl_pagos.agregarPago);

// Ruta para mostrar la vista de pagos
router.get("/pagos", ctrl_pagos.mostrarPagos);

module.exports = router;
