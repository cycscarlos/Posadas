const { query } = require("../database/db.js");
const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../env", ".env") });

/**
 * Variables para controlar el modo de prueba
 * TEST_MODE: Completamente de prueba, incluye datos simulados
 * SEMI_TEST_MODE: Usa datos reales de la BD pero simula la API de WhatsApp
 */
const TEST_MODE = false; // Cambiar a false para usar datos reales de clientes
const SEMI_TEST_MODE = true; // Usa números reales pero simula el envío de mensajes

/**
 * Función para mostrar el formulario de envío de mensajes WhatsApp
 */
exports.mostrarFormulario = async (req, res) => {
  try {
    // Consulta para obtener todos los clientes con teléfono válido
    const clientes = await query(
      "SELECT id_cliente, nombre, apellido, telefono FROM `clientes` WHERE telefono IS NOT NULL AND telefono != '' ORDER BY nombre ASC"
    );

    console.log(
      `Se encontraron ${clientes.length} clientes con números de teléfono`
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

      // Eliminar espacios, guiones u otros caracteres no numéricos
      telefono = telefono.replace(/[^0-9+]/g, "");

      return {
        ...cliente,
        telefono: telefono,
      };
    });

    // Determinar el mensaje del modo de prueba
    let testModeMessage = "";
    if (TEST_MODE) {
      testModeMessage =
        "MODO DE PRUEBA COMPLETO: Se usarán datos simulados y no se enviarán mensajes";
    } else if (SEMI_TEST_MODE) {
      testModeMessage =
        "MODO HÍBRIDO: Se usarán datos reales pero se simularán los envíos a WhatsApp";
    }

    // Renderizar la vista
    res.render("whatsapp-envioMensajes", {
      clientes: clientesFormateados,
      testMode: TEST_MODE || SEMI_TEST_MODE, // El banner se muestra en ambos modos
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
      // El problema está aquí - el teléfono del formulario ya está en formato internacional
      // pero en la base de datos puede estar en formato local
      // Eliminar el prefijo internacional para buscar en la base de datos
      let telefonoLimpio = telefono;

      // Si el teléfono empieza con +58, eliminar el prefijo para buscar en la BD
      if (telefonoLimpio.startsWith("+58")) {
        telefonoLimpio = "0" + telefonoLimpio.substring(3); // Convertir +58414... a 0414...
      }

      console.log(
        `Buscando cliente con teléfono original: ${telefono}, convertido a: ${telefonoLimpio}`
      );

      // Buscar con LIKE para ser más flexibles con el formato
      const result = await query(
        "SELECT id_cliente, nombre, apellido, telefono FROM `clientes` WHERE telefono LIKE ? OR telefono LIKE ?",
        [telefonoLimpio, telefono]
      );

      clientes = result;
      console.log(`Clientes encontrados: ${clientes.length}`);
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

    console.log(`Preparando envío para ${clientes.length} clientes`);

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

    // Si estamos en modo de prueba completo o semi-prueba, simular resultados
    if (TEST_MODE || SEMI_TEST_MODE) {
      const resultados = mensajesParaEnviar.map((destinatario, index) => {
        // Determinar si estamos procesando un solo cliente o varios
        const esClienteIndividual = mensajesParaEnviar.length === 1;

        // Para clientes individuales: siempre éxito
        // Para colectivos: 75% probabilidad de éxito (fallará el 25%)
        const probabilidadExito = esClienteIndividual ? 1.0 : 0.75;
        const exito = Math.random() < probabilidadExito;

        console.log(
          `Simulando envío para ${
            destinatario.nombre
          }: esIndividual=${esClienteIndividual}, aleatorio=${Math.random().toFixed(
            2
          )}, resultado=${exito ? "ÉXITO" : "FALLO"}`
        );

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

      // Verificación de seguridad para clientes individuales
      const esClienteIndividual = mensajesParaEnviar.length === 1;
      if (esClienteIndividual && exitosos === 0) {
        console.log(
          "ADVERTENCIA: El cliente individual debería tener éxito pero se marcó como fallido"
        );
        // Forzar éxito para cliente individual
        detalles[0].enviado = true;
        detalles[0].error = null;
      }

      // Recalcular después de la corrección de seguridad
      const exitososCorregidos = detalles.filter((d) => d.enviado).length;
      const fallidosCorregidos = detalles.filter((d) => !d.enviado).length;

      // Simular una pequeña demora para que parezca que está procesando
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Respuesta simulada
      const modoTexto = TEST_MODE ? "[MODO PRUEBA]" : "[MODO HÍBRIDO]";
      if (fallidosCorregidos === 0) {
        return res.status(200).json({
          success: true,
          message: `${modoTexto} Todos los mensajes (${exitososCorregidos}) han sido enviados correctamente.`,
          detalles: detalles,
          testMode: true,
        });
      } else if (exitososCorregidos === 0) {
        return res.status(500).json({
          success: false,
          message: `${modoTexto} No se pudo enviar ningún mensaje (${fallidosCorregidos} fallidos).`,
          detalles: detalles,
          testMode: true,
        });
      } else {
        return res.status(207).json({
          success: true,
          message: `${modoTexto} Se enviaron ${exitososCorregidos} mensajes, pero ${fallidosCorregidos} fallaron.`,
          detalles: detalles,
          testMode: true,
        });
      }
    }

    // Código para envío real a WhatsApp (se ejecuta solo si ambos modos de test son false)
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
  // Verificar la configuración de WhatsApp
  const version = process.env.WHATSAPP_API_VERSION || "v17.0";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // Validación exhaustiva de la configuración
  const erroresConfiguracion = [];
  if (!phoneNumberId)
    erroresConfiguracion.push("WHATSAPP_PHONE_NUMBER_ID no está configurado");
  if (!accessToken)
    erroresConfiguracion.push("WHATSAPP_ACCESS_TOKEN no está configurado");

  if (erroresConfiguracion.length > 0) {
    console.error(
      "Errores de configuración de WhatsApp:",
      erroresConfiguracion
    );
    throw new Error(
      `Configuración de WhatsApp incompleta: ${erroresConfiguracion.join(", ")}`
    );
  }

  // Validar el número de teléfono
  if (!numero || !numero.match(/^\+[0-9]{10,15}$/)) {
    throw new Error(
      `Número de teléfono inválido: ${numero}. Debe tener formato internacional (+XXXXXXXXXX)`
    );
  }

  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  console.log(
    `Enviando mensaje a ${numero} usando el ID de teléfono ${phoneNumberId}`
  );

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

    const mensajeId = response.data?.messages?.[0]?.id || "desconocido";
    console.log(`Mensaje enviado a ${numero} con ID: ${mensajeId}`);

    // Registrar en base de datos si se desea
    // await query("INSERT INTO mensajes_whatsapp (telefono, mensaje, fecha_envio, status, mensaje_id) VALUES (?, ?, NOW(), ?, ?)",
    //   [numero, mensaje, "enviado", mensajeId]);

    return {
      success: true,
      messageId: mensajeId,
      data: response.data,
    };
  } catch (error) {
    // Extraer información de error más detallada
    const errorDetalle = error.response?.data?.error || {};
    const errorCodigo = errorDetalle.code || error.code || "UNKNOWN";
    const errorMensaje =
      errorDetalle.message || error.message || "Error desconocido";

    console.error(
      `Error en API de WhatsApp [${errorCodigo}]:`,
      errorMensaje,
      error.response?.data || error.message
    );

    // Registrar el error si se desea
    // await query("INSERT INTO mensajes_whatsapp (telefono, mensaje, fecha_envio, status, error) VALUES (?, ?, NOW(), ?, ?)",
    //   [numero, mensaje, "error", errorMensaje]);

    throw new Error(
      `Error al enviar mensaje por WhatsApp: ${errorMensaje} (Código: ${errorCodigo})`
    );
  }
}
