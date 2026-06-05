const express = require("express");
const router = express.Router();
const authorize = require("../middlewares/authorize");

const ctrl_whatsappEnvioMsgs = require("../controllers/ctrl_whatsappEnvioMsgs");

// Ruta para mostrar el formulario de envío de WhatsApp
router.get("/whatsapp-envioMensajes", ctrl_whatsappEnvioMsgs.mostrarFormulario);

// ruta para generar mensajes y enviarlos a través de WhatsApp.
router.post("/whatsapp-envioMensajes", authorize(["admin"]), ctrl_whatsappEnvioMsgs.whatsapp);

module.exports = router;
