const express = require("express");
const router = express.Router();
const conexion = require("./database/db");
//const { ctrl_home } = require("./controllers/x-ctrl_home"); // Importar el controlador

// Rutas
// router.get("/", ctrl_home);

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
// const inicio = require("./routes/x-inicio");
// const logAdmin = require("./routes/logAdmin");
const login = require("./routes/login");
const logout = require("./routes/logout");
const menu = require("./routes/menu");
const mapaHabitaciones = require("./routes/mapaHabitaciones");
const mapaHabitacionCalendario = require("./routes/mapaHabitacionCalendario");
const pagos = require("./routes/pagos");
const passwordReset = require("./routes/passwordReset");
const preReservaciones = require("./routes/preReservaciones");
// const portada = require("./routes/portada");
const registro = require("./routes/registro");
const statusReservaciones = require("./routes/statusReservaciones");
const checkServerDB = require("./routes/checkServerDB");
const userManagement = require("./routes/userManagement");
const whatsappEnvioMsgs = require("./routes/whatsappEnvioMsgs");
// const whatsappReservaciones = require("./routes/whatsappReservaciones");

// Usar las rutas con el método router
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
// router.use(inicio);
// router.use(logAdmin);
router.use(login);
router.use(logout);
router.use(menu);
router.use(mapaHabitaciones);
router.use(mapaHabitacionCalendario);
router.use(pagos);
router.use(passwordReset);
router.use("/preReservaciones", preReservaciones);
// router.use(portada);
router.use(registro);
router.use(statusReservaciones);
router.use(checkServerDB);
router.use(userManagement);
router.use(whatsappEnvioMsgs);
// router.use(whatsappReservaciones);

module.exports = router;
