const express = require("express");
const router = express.Router();
const ctrl_pagos = require("../controllers/ctrl_pagos");
const authorize = require("../middlewares/authorize");

// Ruta para agregar un nuevo pago a un cliente existente
router.post("/pagos/:id/agregar-pago", authorize(["admin"]), ctrl_pagos.agregarPago);

// Ruta para mostrar la vista de pagos
router.get("/pagos", authorize(["admin"]), ctrl_pagos.mostrarPagos);

module.exports = router;
