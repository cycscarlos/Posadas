const { query } = require("../database/db.js");
const axios = require("axios");

// Función para mostrar el formulario de envío de mensajes WhatsApp
exports.mostrarFormulario = async (req, res) => {
  try {
    const clientes = await query(
      "SELECT nombre, apellido, telefono FROM `clientes`"
    ); // Obtener clientes de la BD
    res.render("whatsapp-envioMensajes", { clientes }); // Pasar clientes a la vista
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).send("Error al obtener los datos de los clientes.");
  }
};

// Función para enviar mensajes por WhatsApp
exports.whatsapp = async (req, res) => {
  const { mensaje, seleccioneTodos, telefono } = req.body; // Mantener 'telefono'

  try {
    let clientes;

    if (seleccioneTodos) {
      // Obtener todos los clientes si está seleccionado
      clientes = await query("SELECT nombre, telefono FROM `clientes`");
    } else if (telefono) {
      // Obtener solo el cliente seleccionado
      const result = await query(
        "SELECT nombre, telefono FROM `clientes` WHERE telefono = ?",
        [telefono]
      );
      clientes = result;
    } else {
      return res
        .status(400)
        .json({ error: "No se han seleccionado clientes." });
    }

    // Envío de mensajes a través de WhatsApp
    const promises = clientes.map(async (cliente) => {
      const numeroCompleto = cliente.telefono; // Asegúrate de que los números de teléfono estén en el formato correcto
      const textoMensaje = `Hola ${cliente.nombre}, ${mensaje}`;

      // Intentando enviar mensaje a WhatsApp
      try {
        await enviarWhatsApp(numeroCompleto, textoMensaje);
      } catch (error) {
        console.error(`Error al enviar mensaje a ${cliente.nombre}:`, error);
        // Retornamos información que pueda ser útil
        return { nombre: cliente.nombre, error: "Error al enviar mensaje" };
      }
    });

    // Espera a que todos los envíos se completen
    const resultados = await Promise.all(promises);

    // Si hay errores, cambia el mensaje
    const errores = resultados.filter((result) => result && result.error);
    if (errores.length > 0) {
      return res.status(207).json({
        message: "Algunos mensajes no se enviaron.",
        errores: errores,
      });
    }

    // Si todo salió bien
    res.status(200).json({ message: "Mensajes enviados correctamente" });
  } catch (error) {
    console.error("Error al enviar mensajes de WhatsApp:", error);
    res.status(500).json({ error: "Error en el envío de mensajes" });
  }
};

// Función para enviar mensajes de WhatsApp
async function enviarWhatsApp(numero, mensaje) {
  const url = `https://graph.facebook.com/v13.0/YOUR_WHATSAPP_PHONE_NUMBER_ID/messages`; // Cambia esto por tu ID de número de WhatsApp
  const token = "YOUR_ACCESS_TOKEN"; // Token de acceso a la API de WhatsApp

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to: numero,
      text: { body: mensaje },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
