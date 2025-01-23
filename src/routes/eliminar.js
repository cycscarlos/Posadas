const express = require("express");
const router = express.Router();
const ctrl_eliminar = require("../controllers/ctrl_eliminar");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
// Ruta para eliminar el registro en la base de datos
router.get("/eliminar/:id", authenticate, authorize(["admin"]), ctrl_eliminar.eliminar);

module.exports = router;
