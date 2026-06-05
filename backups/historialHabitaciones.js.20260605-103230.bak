const express = require("express");
const router = express.Router();
const ctrl_historialHabitaciones = require("../controllers/ctrl_historialHabitaciones");
const ctrl_registroModal = require("../controllers/ctrl_registroModal"); // Importar el nuevo controlador

// Ruta para mostrar disponibilidad en formato de calendario
router.get(
  "/historialHabitaciones",
  ctrl_historialHabitaciones.verCalendarioDisponibilidad
);

// Ruta para consultar al cliente desde el calendario
router.get(
  "/consulta-clienteCalendario/:id",
  ctrl_historialHabitaciones.consultaClienteCalendario
);

// Nueva ruta para manejar la solicitud AJAX y renderizar la vista 'ficha-modal'
router.get(
  "/consulta-fichaModal/:id",
  ctrl_historialHabitaciones.consultaFichaModal
);

// Nueva ruta para manejar la solicitud AJAX y renderizar la vista del formulario de registro
router.get(
  "/cargar-formulario-registro",
  ctrl_historialHabitaciones.cargarFormularioRegistro
);

// Nueva ruta para manejar el registro de clientes desde el modal
router.post("/registro-modal", ctrl_registroModal.registroClienteModal);

// Ruta para mostrar el formulario de registro
router.get("/registro-modal", (req, res) => res.render("registro-modal.ejs"));

module.exports = router;
