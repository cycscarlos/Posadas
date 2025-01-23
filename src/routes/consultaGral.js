const express = require("express");
const router = express.Router();
const ctrl_consultaGral = require("../controllers/ctrl_consultaGral");

// Ruta para mostrar todos los registros en una consulta general de la BDD
router.get("/consultaGral", ctrl_consultaGral.consulta);

module.exports = router;