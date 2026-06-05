const express = require("express");
const router = express.Router();
const ctrl_editar = require("../controllers/ctrl_editar");
const authorize = require("../middlewares/authorize");

// Ruta para llamar al formulario de editar registros
router.get("/editar/:id", authorize(["admin"]), ctrl_editar.editar);

module.exports = router;
