const { query } = require("../database/db.js");
const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../env", ".env") });

/**
 * Variable para controlar el modo de prueba
 * En modo de prueba, los mensajes no se envían realmente, se simulan respuestas
 */
const TEST_MODE = true; // Cambiar a false cuando se tenga la configuración real de WhatsApp

/**
 * Función para mostrar el formulario de envío de mensajes WhatsApp
 */
exports.mostrarFormulario = async (req, res) => {
  try {
    const clientes = await query(
      "SELECT id_cliente, nombre, apellido, telefono FROM `clientes` WHERE telefono IS NOT NULL AND telefono != ''"
    );

    // Formatear los números de teléfono para asegurar que estén en formato internacional
    const clientesFormateados = clientes.map((cliente) => {
      // Asegurar que el número tenga formato internacional (añadir +58 si es necesario)
      let telefono = cliente.telefono;
      if (!telefono.startsWith("+")) {
        if (telefono.startsWith("0")) {
          telefono = "+58" + telefono.substring(1);
        } else {
          telefono = "+58" + telefono;
        }
      }

      return {
        ...cliente,
        telefono: telefono,
      };
    });

    // Si estamos en modo prueba, agregamos un mensaje
    const testModeMessage = TEST_MODE
      ? "MODO DE PRUEBA ACTIVADO: Los mensajes no se enviarán realmente a WhatsApp"
      : "";

    // Volvemos a usar la vista original como lo solicitó el usuario
    res.render("whatsapp-envioMensajes", {
      clientes: clientesFormateados,
      testMode: TEST_MODE,
      testModeMessage,
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).send("Error al obtener los datos de los clientes.");
  }
};

/**
 * Función para enviar mensajes por WhatsApp
 */
exports.whatsapp = async (req, res) => {
  const { mensaje, seleccioneTodos, telefono } = req.body;

  // Validación básica
  if (!mensaje || (!seleccioneTodos && !telefono)) {
    return res.status(400).json({
      success: false,
      message: "El mensaje y al menos un destinatario son obligatorios.",
    });
  }

  try {
    let clientes;

    if (seleccioneTodos) {
      // Obtener todos los clientes con número de teléfono
      clientes = await query(
        "SELECT id_cliente, nombre, apellido, telefono FROM `clientes` WHERE telefono IS NOT NULL AND telefono != ''"
      );
    } else if (telefono) {
      // Obtener solo el cliente seleccionado
      const result = await query(
        "SELECT id_cliente, nombre, apellido, telefono FROM `clientes` WHERE telefono = ?",
        [telefono]
      );
      clientes = result;
    } else {
      return res.status(400).json({
        success: false,
        message: "No se han seleccionado clientes válidos.",
      });
    }

    if (clientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron clientes con números de teléfono válidos.",
      });
    }

    // Formatear los números y preparar los mensajes
    const mensajesParaEnviar = clientes.map((cliente) => {
      // Asegurar que el número tenga formato internacional
      let numeroFormateado = cliente.telefono;
      if (!numeroFormateado.startsWith("+")) {
        if (numeroFormateado.startsWith("0")) {
          numeroFormateado = "+58" + numeroFormateado.substring(1);
        } else {
          numeroFormateado = "+58" + numeroFormateado;
        }
      }

      // Eliminar espacios, guiones u otros caracteres no numéricos
      numeroFormateado = numeroFormateado.replace(/[^0-9+]/g, "");

      return {
        id: cliente.id_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: numeroFormateado,
        mensaje: `Hola ${cliente.nombre}, ${mensaje}`,
      };
    });

    // Si estamos en modo prueba, simular resultados variados para demostración
    if (TEST_MODE) {
      const resultados = mensajesParaEnviar.map((destinatario, index) => {
        // Simular algunos errores aleatorios (1 de cada 4 mensajes fallará)
        const exito = index % 4 !== 0;

        if (exito) {
          return {
            status: "fulfilled",
            value: {
              id: destinatario.id,
              nombre: `${destinatario.nombre} ${destinatario.apellido}`,
              telefono: destinatario.telefono,
              enviado: true,
              simulado: true,
            },
          };
        } else {
          // Simular diferentes tipos de errores
          const errores = [
            "Número no válido para WhatsApp",
            "Usuario no disponible en WhatsApp",
            "Tiempo de espera agotado",
            "Límite de mensajes alcanzado",
          ];
          const errorAleatorio =
            errores[Math.floor(Math.random() * errores.length)];

          return {
            status: "fulfilled",
            value: {
              id: destinatario.id,
              nombre: `${destinatario.nombre} ${destinatario.apellido}`,
              telefono: destinatario.telefono,
              enviado: false,
              error: errorAleatorio,
              simulado: true,
            },
          };
        }
      });

      // Procesamos los resultados simulados
      const exitosos = resultados.filter((r) => r.value.enviado).length;
      const fallidos = resultados.filter((r) => !r.value.enviado).length;
      const detalles = resultados.map((r) => r.value);

      // Simular una pequeña demora para que parezca que está procesando
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Respuesta simulada
      if (fallidos === 0) {
        return res.status(200).json({
          success: true,
          message: `[SIMULADO] Todos los mensajes (${exitosos}) han sido enviados correctamente.`,
          detalles: detalles,
          testMode: true,
        });
      } else if (exitosos === 0) {
        return res.status(500).json({
          success: false,
          message: `[SIMULADO] No se pudo enviar ningún mensaje (${fallidos} fallidos).`,
          detalles: detalles,
          testMode: true,
        });
      } else {
        return res.status(207).json({
          success: true,
          message: `[SIMULADO] Se enviaron ${exitosos} mensajes, pero ${fallidos} fallaron.`,
          detalles: detalles,
          testMode: true,
        });
      }
    }

    // Código para envío real a WhatsApp (se ejecuta solo si TEST_MODE es false)
    const resultados = await Promise.allSettled(
      mensajesParaEnviar.map(async (destinatario) => {
        try {
          await enviarWhatsApp(destinatario.telefono, destinatario.mensaje);
          return {
            id: destinatario.id,
            nombre: `${destinatario.nombre} ${destinatario.apellido}`,
            telefono: destinatario.telefono,
            enviado: true,
          };
        } catch (error) {
          console.error(
            `Error al enviar mensaje a ${destinatario.nombre}:`,
            error
          );
          return {
            id: destinatario.id,
            nombre: `${destinatario.nombre} ${destinatario.apellido}`,
            telefono: destinatario.telefono,
            enviado: false,
            error: error.message || "Error al enviar el mensaje",
          };
        }
      })
    );

    // Procesamos los resultados
    const exitosos = resultados.filter(
      (r) => r.status === "fulfilled" && r.value.enviado
    ).length;
    const fallidos = resultados.filter(
      (r) => r.status === "rejected" || !r.value.enviado
    ).length;
    const detalles = resultados.map((r) =>
      r.status === "fulfilled" ? r.value : r.reason
    );

    // Respuesta
    if (fallidos === 0) {
      return res.status(200).json({
        success: true,
        message: `Todos los mensajes (${exitosos}) han sido enviados correctamente.`,
        detalles: detalles,
      });
    } else if (exitosos === 0) {
      return res.status(500).json({
        success: false,
        message: `No se pudo enviar ningún mensaje (${fallidos} fallidos).`,
        detalles: detalles,
      });
    } else {
      return res.status(207).json({
        success: true,
        message: `Se enviaron ${exitosos} mensajes, pero ${fallidos} fallaron.`,
        detalles: detalles,
      });
    }
  } catch (error) {
    console.error("Error general al enviar mensajes de WhatsApp:", error);
    res.status(500).json({
      success: false,
      message: "Error en el sistema de mensajería WhatsApp",
      error: error.message,
    });
  }
};

/**
 * Función para enviar un mensaje individual por WhatsApp usando la API oficial
 * @param {string} numero - Número de teléfono en formato internacional
 * @param {string} mensaje - Texto del mensaje a enviar
 */
async function enviarWhatsApp(numero, mensaje) {
  const version = process.env.WHATSAPP_API_VERSION || "v17.0";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "Configuración de WhatsApp incompleta. Verifique WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ACCESS_TOKEN en .env"
    );
  }

  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  try {
    // Enviamos el mensaje con formato text
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: numero,
        type: "text",
        text: {
          preview_url: false,
          body: mensaje,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(
        `Error de WhatsApp API: ${response.status} - ${response.statusText}`
      );
    }

    console.log(
      `Mensaje enviado a ${numero} con ID: ${
        response.data?.messages?.[0]?.id || "desconocido"
      }`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error en API de WhatsApp:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Error en API de WhatsApp"
    );
  }
}
