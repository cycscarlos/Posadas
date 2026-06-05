const express = require("express");
const router = express.Router();
const ctrl_consultaGral = require("../controllers/ctrl_consultaGral");
const authorize = require("../middlewares/authorize");

// Ruta para mostrar todos los registros en una consulta general de la BDD
router.get("/consultaGral", authorize(["admin"]), ctrl_consultaGral.consulta);

module.exports = router;