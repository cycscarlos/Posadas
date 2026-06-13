const express = require("express");
const router = express.Router();

const authenticate = require("./middlewares/authenticate");

// Rutas públicas (no requieren autenticación)
const login = require("./routes/login");
const logout = require("./routes/logout");
const passwordReset = require("./routes/passwordReset");
const chatbot = require("./routes/chatbot");

router.use(login);
router.use(logout);
router.use(passwordReset);
router.use(chatbot);

// A partir de aquí, todas las rutas requieren autenticación
router.use(authenticate);

// Rutas protegidas
const administracionManualEstados = require("./routes/administracionManualEstados");
const actualizar = require("./routes/actualizar");
const historialHabitaciones = require("./routes/historialHabitaciones");
const consultaGral = require("./routes/consultaGral");
const consultaCliente = require("./routes/consultaCliente");
const consultaClienteCalendario = require("./routes/consultaClienteCalendario");
const consultaPagos = require("./routes/consultaPagos");
const disponibilidadPorFecha = require("./routes/disponibilidadPorFecha");
const depuracion = require("./routes/depuracion");
const editar = require("./routes/editar");
const eliminar = require("./routes/eliminar");
const envioEmails = require("./routes/envioEmails");
const graficas = require("./routes/graficas");
const menu = require("./routes/menu");
const mapaHabitaciones = require("./routes/mapaHabitaciones");
const mapaHabitacionCalendario = require("./routes/mapaHabitacionCalendario");
const pagos = require("./routes/pagos");
const preReservaciones = require("./routes/preReservaciones");
const registro = require("./routes/registro");
const statusReservaciones = require("./routes/statusReservaciones");
const userManagement = require("./routes/userManagement");
const whatsappEnvioMsgs = require("./routes/whatsappEnvioMsgs");

router.use(administracionManualEstados);
router.use(actualizar);
router.use(historialHabitaciones);
router.use(consultaGral);
router.use(consultaCliente);
router.use(consultaClienteCalendario);
router.use(consultaPagos);
router.use(disponibilidadPorFecha);
router.use(depuracion);
router.use(editar);
router.use(eliminar);
router.use(envioEmails);
router.use(graficas);
router.use(menu);
router.use(mapaHabitaciones);
router.use(mapaHabitacionCalendario);
router.use(pagos);
router.use("/preReservaciones", preReservaciones);
router.use(registro);
router.use(statusReservaciones);
router.use(userManagement);
router.use(whatsappEnvioMsgs);

module.exports = router;
