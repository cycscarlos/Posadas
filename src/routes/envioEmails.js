const express = require("express");
const router = express.Router();
const ctrl_envioEmails = require("../controllers/ctrl_envioEmails");
const authorize = require("../middlewares/authorize");

// Rutas para el envío de correos
router.get("/enviar-correo", ctrl_envioEmails.mostrarFormularioCorreo);

// Ruta para mostrar el formulario de envío
router.post("/enviar-correo", authorize(["admin"]), ctrl_envioEmails.enviarCorreo); 

module.exports = router;
