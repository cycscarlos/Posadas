const { query } = require("../database/db.js");
const path = require("path");
const nodemailer = require("nodemailer");

// Función para mostrar el formulario de envío de correos
exports.mostrarFormularioCorreo = async (req, res) => {
  try {
    const clientes = await query(
      "SELECT nombre, apellido, correo FROM `clientes`"
    );
    res.render("enviar-correo", { clientes });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).send("Error al obtener los datos de los clientes.");
  }
};

// Función para enviar correos
exports.enviarCorreo = async (req, res) => {
  const { mensaje, seleccioneTodos, email } = req.body;

  try {
    let destinatarios;

    if (seleccioneTodos) {
      // Obtener todos los clientes
      destinatarios = await query("SELECT correo FROM `clientes`");
    } else {
      // Asegurarse de que el email se recibe correctamente del cuerpo de la solicitud
      destinatarios = [{ correo: email }];
    }

    // Configuración del transporter para nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // Puedes usar otro servicio de correo
      auth: {
        user: process.env.EMAIL_USER, // Tu email
        pass: process.env.EMAIL_PASS, // Tu contraseña
      },
    });

    // Enviar el correo a cada destinatario
    console.log(
      "Correos destino: ",
      destinatarios.map((contacto) => contacto.correo)
    );

    for (const contacto of destinatarios) {
      console.log(`Enviando correo a: ${contacto.correo}`);
      const htmlContent = mensaje
        ? `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; padding: 20px;">${mensaje.replace(/\n/g, '<br>')}</div>`
        : '';

      await transporter.sendMail({
        from: `"Posada" <${process.env.EMAIL_USER}>`,
        to: contacto.correo,
        subject: "Posada - ¡Invitación!",
        text: mensaje,
        html: htmlContent,
      });
    }

    res.status(200).json({ message: "Correo(s) enviado(s) correctamente" });
  } catch (error) {
    console.error("Error al enviar correos:", error);
    res.status(500).json({ error: "Error en el envío de correos" });
  }
};
