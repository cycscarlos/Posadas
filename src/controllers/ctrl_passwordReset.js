const { query } = require("../database/db.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { hashPassword } = require("../utils/password.js");

// Configuración del transportador de correo (puedes moverlo a un archivo de configuración)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT === "465", // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// Verificar la configuración de correo al iniciar
transporter.verify(function (error, success) {
  if (error) {
    console.error("Error al configurar el servidor de correo:", error);
  } else {
    console.log("Servidor de correo listo para enviar mensajes");
  }
});

// Muestra la página de solicitud de recuperación de contraseña
exports.showForgotPasswordForm = (req, res) => {
  res.render("forgot-password", {
    alert: undefined,
  });
};

// Procesa la solicitud de recuperación de contraseña
exports.processForgotPassword = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.render("forgot-password", {
      alert: true,
      alertTitle: "Error",
      alertMessage:
        "Por favor, ingresa tu nombre de usuario o correo electrónico",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: "forgot-password",
    });
  }

  try {
    // Buscar al usuario por nombre de usuario o correo
    const userQuery = `
      SELECT id, username, fullname, correo AS email
      FROM login
      WHERE username = ? OR correo = ?
    `;
    const users = await query(userQuery, [username, username]);

    if (users.length === 0) {
      return res.render("forgot-password", {
        alert: true,
        alertTitle: "Error",
        alertMessage:
          "No se encontró ningún usuario con ese nombre de usuario o correo electrónico",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
        ruta: "forgot-password",
      });
    }

    const user = users[0];
    const userEmail = user.email;

    if (!userEmail) {
      return res.render("forgot-password", {
        alert: true,
        alertTitle: "Error",
        alertMessage: "No hay correo electrónico asociado a esta cuenta",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
        ruta: "forgot-password",
      });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora desde ahora

    // Eliminar tokens antiguos para este usuario
    await query("DELETE FROM password_reset_tokens WHERE user_id = ?", [
      user.id,
    ]);

    // Almacenar el nuevo token
    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    // Construir la URL de restablecimiento
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${token}`;

    // Enviar correo electrónico
    const mailOptions = {
      from: `"Posada - Sistema de Reservas" <${
        process.env.MAIL_FROM || process.env.MAIL_USER
      }>`,
      to: userEmail,
      subject: "Recuperación de contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2a3b4c;">Recuperación de Contraseña - Posada</h2>
          <p>Hola ${user.fullname},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
          <p>Este enlace será válido por 1 hora.</p>
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Este es un correo electrónico automático, por favor no respondas a este mensaje.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Responder con éxito
    return res.render("forgot-password", {
      alert: true,
      alertTitle: "Correo Enviado",
      alertMessage:
        "Te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña",
      alertIcon: "success",
      showConfirmButton: true,
      timer: 5000,
      ruta: "login",
    });
  } catch (error) {
    console.error("Error en la recuperación de contraseña:", error);
    return res.render("forgot-password", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Ha ocurrido un error al procesar tu solicitud",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: "forgot-password",
    });
  }
};

// Muestra el formulario de restablecimiento de contraseña
exports.showResetPasswordForm = async (req, res) => {
  const { token } = req.params;

  try {
    // Verificar si el token existe y es válido
    const tokenResult = await query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = 0",
      [token]
    );

    if (tokenResult.length === 0) {
      return res.render("login", {
        alert: true,
        alertTitle: "Error",
        alertMessage:
          "El enlace de restablecimiento no es válido o ha expirado",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
        ruta: "login",
      });
    }

    // Mostrar el formulario de restablecimiento
    res.render("reset-password", {
      token,
      alert: undefined,
    });
  } catch (error) {
    console.error("Error al mostrar el formulario de restablecimiento:", error);
    res.render("login", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Ha ocurrido un error al procesar tu solicitud",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: "login",
    });
  }
};

// Procesa el restablecimiento de la contraseña
exports.processResetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  // Validación básica
  if (!token || !password || !confirmPassword) {
    return res.render("reset-password", {
      token,
      alert: true,
      alertTitle: "Error",
      alertMessage: "Todos los campos son obligatorios",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: `reset-password/${token}`,
    });
  }

  if (password !== confirmPassword) {
    return res.render("reset-password", {
      token,
      alert: true,
      alertTitle: "Error",
      alertMessage: "Las contraseñas no coinciden",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: `reset-password/${token}`,
    });
  }

  if (password.length < 8) {
    return res.render("reset-password", {
      token,
      alert: true,
      alertTitle: "Error",
      alertMessage: "La contraseña debe tener al menos 8 caracteres",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: `reset-password/${token}`,
    });
  }

  try {
    // Verificar si el token existe y es válido
    const tokenResult = await query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = 0",
      [token]
    );

    if (tokenResult.length === 0) {
      return res.render("login", {
        alert: true,
        alertTitle: "Error",
        alertMessage:
          "El enlace de restablecimiento no es válido o ha expirado",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
        ruta: "login",
      });
    }

    const userToken = tokenResult[0];

    // Hashear la nueva contraseña
    const hashedPassword = await hashPassword(password);

    // Actualizar la contraseña del usuario
    await query(
      "UPDATE login SET clave = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [hashedPassword, userToken.user_id]
    );

    // Marcar el token como utilizado
    await query("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [
      userToken.id,
    ]);

    // Responder con éxito
    return res.render("login", {
      alert: true,
      alertTitle: "Éxito",
      alertMessage:
        "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.",
      alertIcon: "success",
      showConfirmButton: true,
      timer: 5000,
      ruta: "login",
    });
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return res.render("reset-password", {
      token,
      alert: true,
      alertTitle: "Error",
      alertMessage: "Ha ocurrido un error al procesar tu solicitud",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: `reset-password/${token}`,
    });
  }
};
