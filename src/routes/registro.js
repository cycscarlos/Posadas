const express = require("express");
const router = express.Router();
const ctrl_registro = require("../controllers/ctrl_registro");
const authorize = require("../middlewares/authorize");

// Ruta para mostrar el formulario de registro
router.get("/registro", (req, res) => res.render("registro.ejs"));

// Ruta para registrar clientes desde el formulario principal
router.post("/registro", authorize(["admin"]), ctrl_registro.registroCliente);

module.exports = router;
