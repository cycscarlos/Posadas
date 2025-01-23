const express = require("express");
const router = express.Router();
const ctrl_logout = require("../controllers/ctrl_logout");

// Ruta para sign-off de usuario
router.get("/logout", ctrl_logout.logout);

module.exports = router;
