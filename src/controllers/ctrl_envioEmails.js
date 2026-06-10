const { query } = require("../database/db.js");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

function buildEmailHtml(nombreCliente, mensajeUsuario) {
  const logoCid = "posadaLogo";
  const beachCid = "beachHeader";
  const mensajeHtml = mensajeUsuario ? mensajeUsuario.replace(/\n/g, '<br>') : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .email-body { margin:0; padding:0; background-color:#e8f4f8; font-family:'Segoe UI',Arial,sans-serif; }
    .email-container { max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.1); }
    .header-img { width:100%; height:auto; display:block; }
    .content { padding:30px 35px; color:#333; }
    .content h1 { color:#0077b6; font-size:24px; margin:0 0 8px; }
    .content .subtitle { color:#666; font-size:14px; margin-bottom:20px; }
    .divider { height:2px; background:linear-gradient(to right,#0077b6,#f6a700); margin:20px 0; border:none; }
    .message-box { background-color:#fdf6ee; border-left:4px solid #f6a700; padding:15px 20px; margin:15px 0; border-radius:0 6px 6px 0; color:#444; font-size:15px; line-height:1.6; }
    .footer { background-color:#0077b6; color:#fff; padding:20px 35px; font-size:13px; line-height:1.5; }
    .footer a { color:#f6a700; text-decoration:none; }
    .social-icon { display:inline-block; margin-right:10px; font-size:18px; }
    .logo-wrap { text-align:center; padding:20px 0 0; }
    .logo-wrap img { height:50px; }
  </style>
</head>
<body class="email-body">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
    <tr>
      <td align="center">
        <div class="email-container">
          <img src="cid:${beachCid}" alt="Playa Posada" class="header-img" style="width:100%; height:auto; display:block;">
          <div class="logo-wrap">
            <img src="cid:${logoCid}" alt="Posada Logo" style="height:50px;">
          </div>
          <div class="content">
            <h1>¡Hola ${nombreCliente}!</h1>
            <p class="subtitle">Gracias por ser parte de nuestra familia Posada.</p>
            <div class="divider"></div>
            ${mensajeHtml ? `<div class="message-box">${mensajeHtml}</div>` : ''}
            <p style="margin-top:20px; color:#555; font-size:14px; line-height:1.6;">
              En <strong>Posada</strong> nos preocupamos por brindarle la mejor experiencia. 
              Ya sea que busque una escapada de fin de semana o unas vacaciones inolvidables, 
              estamos aquí para hacer de su estancia algo especial.
            </p>
            <p style="color:#555; font-size:14px; line-height:1.6;">
              ¡Reserve ahora y descubra el paraíso en la costa!
            </p>
            <div class="divider"></div>
            <p style="text-align:center; margin-top:10px;">
              <a href="#" style="display:inline-block; background-color:#f6a700; color:#fff; text-decoration:none; padding:12px 30px; border-radius:6px; font-weight:bold; font-size:15px;">Ver Ofertas</a>
            </p>
          </div>
          <div class="footer">
            <p style="margin:0 0 8px;"><strong>Posada</strong> — Su lugar en la playa</p>
            <p style="margin:0 0 4px;"><span style="font-size:16px;">📞</span> +58 414 324 6396</p>
            <p style="margin:0 0 4px;"><span style="font-size:16px;">✉️</span> <a href="mailto:${process.env.EMAIL_USER || 'contacto@posada.com'}">${process.env.EMAIL_USER || 'contacto@posada.com'}</a></p>
            <p style="margin:10px 0 0; font-size:11px; opacity:0.7;">
              Si no desea recibir más correos promocionales, responda este mensaje indicando "Cancelar suscripción".
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
      destinatarios = await query("SELECT nombre, correo FROM `clientes`");
    } else {
      destinatarios = [{ correo: email }];
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const imgDir = path.join(__dirname, "../../public/img");
    const beachPath = path.join(imgDir, "playa7.webp");
    const logoPath = path.join(imgDir, "posadaLogo.webp");

    console.log(
      "Correos destino: ",
      destinatarios.map((contacto) => contacto.correo)
    );

    for (const contacto of destinatarios) {
      console.log(`Enviando correo a: ${contacto.correo}`);
      const htmlContent = buildEmailHtml(
        contacto.nombre || "estimado cliente",
        mensaje || ""
      );

      await transporter.sendMail({
        from: `"Posada" <${process.env.EMAIL_USER}>`,
        to: contacto.correo,
        subject: "Posada — ¡Su escapada perfecta le espera!",
        text: mensaje || "",
        html: htmlContent,
        attachments: [
          {
            filename: "playa7.webp",
            path: beachPath,
            cid: "beachHeader",
          },
          {
            filename: "posadaLogo.webp",
            path: logoPath,
            cid: "posadaLogo",
          },
        ],
      });
    }

    res.status(200).json({ message: "Correo(s) enviado(s) correctamente" });
  } catch (error) {
    console.error("Error al enviar correos:", error);
    res.status(500).json({ error: "Error en el envío de correos" });
  }
};
