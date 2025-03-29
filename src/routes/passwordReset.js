const express = require("express");
const router = express.Router();
const {
  showForgotPasswordForm,
  processForgotPassword,
  showResetPasswordForm,
  processResetPassword,
} = require("../controllers/ctrl_passwordReset");

// Ruta para mostrar el formulario de solicitud de recuperación
router.get("/forgot-password", showForgotPasswordForm);

// Ruta para procesar la solicitud de recuperación
router.post("/forgot-password", processForgotPassword);

// Ruta para mostrar el formulario de restablecimiento (con token)
router.get("/reset-password/:token", showResetPasswordForm);

// Ruta para procesar el restablecimiento de contraseña
router.post("/reset-password", processResetPassword);

module.exports = router;
