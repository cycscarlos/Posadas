const express = require("express");
const router = express.Router();
const ctrl_login = require("../controllers/ctrl_login");

router.get("/login", ctrl_login.login);
 
// Ruta para sign-in de usuario y procesar el formulario de Login
router.post("/login", ctrl_login.ingresar);

module.exports = router;
