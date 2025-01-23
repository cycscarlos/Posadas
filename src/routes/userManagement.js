const express = require("express");
const router = express.Router();
const {
  registerUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/ctrl_userManagement");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

// Ruta para registrar un nuevo usuario
router.post("/register", authenticate, authorize(["admin"]), registerUser);

// Ruta para actualizar un usuario
router.post("/update/:id", authenticate, authorize(["admin"]), updateUser);

// Ruta para eliminar un usuario
router.post("/delete/:id", authenticate, authorize(["admin"]), deleteUser);

// Ruta para obtener todos los usuarios
router.get("/users", authenticate, authorize(["admin"]), getAllUsers);

module.exports = router;
