const { query } = require("../database/db");

const hotelInfo = {
  nombre: "Posada Casa Manantial",
  direccion: "Maracay, Edo. Aragua, Venezuela",
  telefono: "(+58) (241) 435.38.60",
  email: "posadacasamanantial@gmail.com",
  web: "https://www.posadacasamanantial.com",
  checkIn: "3:00 PM",
  checkOut: "12:00 PM",
  servicios: [
    "Desayuno incluido",
    "Piscina",
    "WiFi",
    "Estacionamiento",
    "Aire acondicionado",
  ],
};

const TIPOS_HABITACION = [
  "Matrimonial",
  "Semi Suite",
  "Suite Junior",
  "Suite",
  "Suite VIP",
];

const intents = [
  {
    name: "menu",
    patterns: [/^menu$/, /^menú$/, /^volver$/, /principal/],
    handler: () => "Seleccioná una opción:",
  },
  {
    name: "contacto",
    patterns: [/^contacto$/, /^contactar$/, /^información de contacto/, /informacion de contacto/],
    handler: () => `Teléfono: ${hotelInfo.telefono}\nEmail: ${hotelInfo.email}\nWeb: ${hotelInfo.web}\nInstagram: @posadacasamanantial`,
  },
  {
    name: "saludo",
    patterns: [/hola/, /buenos días/, /buenas tardes/, /buenas noches/, /qué tal/, /que tal/, /buen(a|o)s/],
    handler: () => "¡Hola! Soy el asistente virtual de Posada Casa Manantial. Estoy aquí para ayudarte con información sobre el hotel, disponibilidad de habitaciones, precios y promociones. ¿En qué puedo ayudarte?",
  },
  {
    name: "horarios",
    patterns: [/check[-\s]?in/, /check[-\s]?out/, /hora de entrada/, /hora de salida/, /horario/, /entrada/, /salida/],
    handler: () => `Nuestros horarios son:\n• Check-in: ${hotelInfo.checkIn}\n• Check-out: ${hotelInfo.checkOut}`,
  },
  {
    name: "direccion",
    patterns: [/dónde están/, /donde estan/, /dirección/, /direccion/, /ubicación/, /ubicacion/, /cómo llegar/, /como llegar/],
    handler: () => `Estamos ubicados en ${hotelInfo.direccion}. Si necesitas indicaciones más precisas, contáctanos al ${hotelInfo.telefono} y con gusto te ayudaremos.`,
  },
  {
    name: "telefono",
    patterns: [/teléfono/, /telefono/, /llamar/, /contacto/, /whatsapp/, /número/, /numero/, /comunicar/],
    handler: () => `Puedes contactarnos al:\n• Teléfono: ${hotelInfo.telefono}\n• Email: ${hotelInfo.email}`,
  },
  {
    name: "email",
    patterns: [/correo/, /email/, /mail/, /e[\-]?mail/],
    handler: () => `Nuestro correo electrónico es: ${hotelInfo.email}. Te responderemos a la brevedad.`,
  },
  {
    name: "web",
    patterns: [/página web/, /pagina web/, /sitio web/, /página/, /pagina/],
    handler: () => `Visita nuestra página web: ${hotelInfo.web}. Allí encontrarás toda la información sobre nuestras instalaciones y servicios.`,
  },
  {
    name: "servicios",
    patterns: [/desayuno/, /piscina/, /wifi/, /estacionamiento/, /aire acondicionado/, /servicio/, /incluye/, /incluido/],
    handler: () => `Ofrecemos los siguientes servicios:\n• ${hotelInfo.servicios.join("\n• ")}`,
  },
  {
    name: "habitaciones",
    patterns: [/tipo de habitación/, /tipos de habitacion/, /tipos de habitación/, /tipo de habitacion/, /qué habitaciones/, /que habitaciones/, /capacidad/, /cuántas personas/, /cuantas personas/, /habitaciones/, /cuántos/, /cuantos/],
    handler: async () => {
      try {
        const rows = await query(
          "SELECT tipo_habitacion, COUNT(*) as cantidad, capacidad FROM habitaciones GROUP BY tipo_habitacion, capacidad ORDER BY FIELD(tipo_habitacion, 'Matrimonial', 'Semi Suite', 'Suite Junior', 'Suite', 'Suite VIP')"
        );
        if (!rows || rows.length === 0) {
          return "Actualmente no tenemos información de habitaciones disponible. Por favor, contáctanos directamente.";
        }
        var lines = rows.map(function (r) {
          return "• " + r.cantidad + " " + r.tipo_habitacion + " (" + r.capacidad + " personas)";
        });
        return "Tipos de habitación:\n\n" + lines.join("\n");
      } catch (err) {
        console.error("Error en chatbot consulta habitaciones:", err);
        return "Ocurrió un error al consultar las habitaciones. Intenta de nuevo más tarde.";
      }
    },
  },
  {
    name: "precio",
    patterns: [/precio/, /cuánto cuesta/, /cuanto cuesta/, /tarifa/, /costo/, /valor/, /costó/, /costar/, /más barato/, /más caro/, /mas barato/, /mas caro/],
    handler: async () => {
      try {
        const rows = await query(
          "SELECT DISTINCT tipo_habitacion, precio FROM habitaciones WHERE precio IS NOT NULL ORDER BY precio"
        );
        if (!rows || rows.length === 0) {
          return "Actualmente no tenemos precios registrados. Por favor, contáctanos directamente para más información.";
        }
        var lines = rows.map(function (r) {
          return "• " + r.tipo_habitacion + ": $" + r.precio;
        });
        return "Precios por noche:\n\n" + lines.join("\n");
      } catch (err) {
        console.error("Error en chatbot consulta precios:", err);
        return "Ocurrió un error al consultar los precios. Intenta de nuevo más tarde.";
      }
    },
  },
  {
    name: "disponibilidad",
    patterns: [/hay disponible/, /hay habitación/, /hay habitacion/, /hay cupo/, /cupo/, /hoy/, /mañana/, /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/],
    handler: async (message) => {
      try {
        const fechaMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        let fechaEntrada, fechaSalida;

        if (fechaMatch) {
          const [, d, m, y] = fechaMatch;
          const year = y.length === 2 ? "20" + y : y;
          fechaEntrada = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
          const fecha = new Date(fechaEntrada);
          fecha.setDate(fecha.getDate() + 1);
          fechaSalida = fecha.toISOString().split("T")[0];
        } else if (/\bhoy\b/i.test(message)) {
          fechaEntrada = new Date().toISOString().split("T")[0];
          const fecha = new Date();
          fecha.setDate(fecha.getDate() + 1);
          fechaSalida = fecha.toISOString().split("T")[0];
        } else if (/\bmañana\b/i.test(message)) {
          const fecha = new Date();
          fecha.setDate(fecha.getDate() + 1);
          fechaEntrada = fecha.toISOString().split("T")[0];
          fecha.setDate(fecha.getDate() + 1);
          fechaSalida = fecha.toISOString().split("T")[0];
        } else {
          return "¿Para qué fecha deseas consultar disponibilidad? Indícame una fecha (ej: 15/06/2026) o dime 'hoy' o 'mañana'.";
        }

         const rows = await query(
           `SELECT h.id_habitacion, h.tipo_habitacion, h.capacidad, h.precio
            FROM habitaciones h
            WHERE h.id_habitacion NOT IN (
              SELECT r.id_habitacion FROM reservas r
              WHERE r.fecha_entrada < ? AND r.fecha_salida > ?
            )
            ORDER BY h.tipo_habitacion`,
           [fechaSalida, fechaEntrada]
        );

        if (!rows || rows.length === 0) {
          return `Lo siento, no tenemos habitaciones disponibles para la fecha indicada.\n\nPuedes contactarnos al ${hotelInfo.telefono} para consultar otras opciones.`;
        }

        const lines = rows.map((r) => {
          const precio = r.precio
            ? `$${Number(r.precio).toLocaleString("es-VE")}`
            : "Consultar precio";
          return `Hab. ${r.id_habitacion} — ${r.tipo_habitacion} (${r.capacidad} personas): ${precio}`;
        });
        return `Habitaciones disponibles para el día solicitado:\n\n${lines.join("\n")}\n\n¿Te gustaría reservar alguna? Contáctanos al ${hotelInfo.telefono} o visita nuestras instalaciones.`;
      } catch (err) {
        console.error("Error en chatbot consulta disponibilidad:", err);
        return "Ocurrió un error al consultar la disponibilidad. Intenta de nuevo más tarde.";
      }
    },
  },
  {
    name: "promociones",
    patterns: [/oferta/, /promoción/, /promocion/, /descuento/, /especial/, /rebaja/, /paquete/],
    handler: async () => {
      try {
        const rows = await query(
          `SELECT titulo, descripcion, fecha_inicio, fecha_fin
           FROM promociones
           WHERE activo = 1
             AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())`
        );
        if (!rows || rows.length === 0) {
          return "Actualmente no tenemos promociones activas. Pero no dudes en contactarnos, siempre tenemos ofertas especiales.";
        }
        const lines = rows.map((r) => {
          const vigencia =
            r.fecha_inicio && r.fecha_fin
              ? ` (vigente del ${new Date(r.fecha_inicio).toLocaleDateString("es-VE")} al ${new Date(r.fecha_fin).toLocaleDateString("es-VE")})`
              : "";
          return `• ${r.titulo}${vigencia}\n  ${r.descripcion || ""}`;
        });
        return `¡Claro! Estas son nuestras promociones activas:\n\n${lines.join("\n\n")}\n\nAprovecha estas ofertas y contáctanos para más detalles.`;
      } catch (err) {
        console.error("Error en chatbot consulta promociones:", err);
        return "Ocurrió un error al consultar las promociones. Intenta de nuevo más tarde.";
      }
    },
  },
  {
    name: "gracias",
    patterns: [/gracias/, /muchas gracias/, /agradecido/, /te agradezco/],
    handler: () => "¡De nada! Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en escribirme. ¡Que tengas un excelente día!",
  },
  {
    name: "ayuda",
    patterns: [/ayuda/, /help/, /qué puedes hacer/, /que puedes hacer/, /opciones/, /comandos/],
    handler: () => `Puedo ayudarte con la siguiente información:\n• Horarios de check-in / check-out\n• Dirección y contacto\n• Servicios del hotel\n• Tipos de habitación y capacidades\n• Precios por noche\n• Disponibilidad de habitaciones con fecha y tipo específico\n• Promociones activas\n\n¿Sobre qué te gustaría saber?`,
  },
];

function detectIntent(message) {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const original = message.toLowerCase();

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      if (pattern.test(original) || pattern.test(lower)) {
        return intent;
      }
    }
  }
  return null;
}

async function processFlowStep(flow, message) {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (message.toLowerCase() === "cancelar" || lower.includes("cancelar") || lower.includes("volver")) {
    return null;
  }

  if (flow.step === "tipo") {
    var match = message.match(/^(\d+)$/);
    var num = match ? parseInt(match[1], 10) : NaN;
    var matched = (num >= 1 && num <= TIPOS_HABITACION.length) ? TIPOS_HABITACION[num - 1] : null;
    if (!matched) {
      return "Por favor, elegí un número del 1 al 5:\n\n1 → Matrimonial\n2 → Semi Suite\n3 → Suite Junior\n4 → Suite\n5 → Suite VIP";
    }
    flow.tipo = matched;
    flow.step = "fecha";
    return { reply: "Perfecto, elegiste " + matched + ". ¿Cuál es la fecha de entrada? (dd/mm/aaaa)", showMenu: false };
  }

  if (flow.step === "fecha") {
    var fechaMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (!fechaMatch) {
      return "Por favor, indicá una fecha válida en formato dd/mm/aaaa (ej: 15/06/2026).";
    }
    var d = fechaMatch[1], m = fechaMatch[2], y = fechaMatch[3];
    var year = y.length === 2 ? "20" + y : y;
    flow.fechaEntrada = year + "-" + m.padStart(2, "0") + "-" + d.padStart(2, "0");
    flow.step = "dias";
    return { reply: "Fecha de entrada: " + d + "/" + m + "/" + year + ". ¿Por cuántos días te gustaría quedarte?", showMenu: false };
  }

  if (flow.step === "dias") {
    var match = message.match(/\d+/);
    var dias = match ? parseInt(match[0], 10) : NaN;
    if (isNaN(dias) || dias < 1 || dias > 30) {
      return "Por favor, indicá un número de días válido (entre 1 y 30).";
    }

    var fechaEntrada = new Date(flow.fechaEntrada);
    var fechaSalida = new Date(fechaEntrada);
    fechaSalida.setDate(fechaSalida.getDate() + dias);
    var fechaSalidaStr = fechaSalida.toISOString().split("T")[0];
    var tipo = flow.tipo;
    delete flow.step;
    flow._done = true;

    var rows = await query(
      "SELECT h.id_habitacion, h.tipo_habitacion, h.capacidad, h.precio" +
      " FROM habitaciones h" +
      " WHERE h.tipo_habitacion = ?" +
      "   AND h.id_habitacion NOT IN (" +
      "     SELECT r.id_habitacion FROM reservas r" +
      "     WHERE r.fecha_entrada < ? AND r.fecha_salida > ?" +
      "       AND r.estado IN ('confirmada', 'activa', 'pre-reservada')" +
      "   )" +
      " ORDER BY h.id_habitacion",
      [tipo, fechaSalidaStr, flow.fechaEntrada]
    );

    var entradaFormatted = fechaEntrada.toLocaleDateString("es-VE");
    var salidaFormatted = fechaSalida.toLocaleDateString("es-VE");

    if (!rows || rows.length === 0) {
      return 'Lo siento, no tenemos habitaciones tipo "' + tipo + '" disponibles del ' + entradaFormatted + ' al ' + salidaFormatted + ' (' + dias + ' noches).\n\nPodés contactarnos al ' + hotelInfo.telefono + ' para consultar otras opciones.';
    }

    var lines = rows.map(function (r) {
      var precio = r.precio ? "$" + Number(r.precio).toLocaleString("es-VE") : "Consultar precio";
      return "• Hab. " + r.id_habitacion + " — " + r.tipo_habitacion + " (" + r.capacidad + " personas): " + precio;
    });
    return 'Habitaciones tipo "' + tipo + '" disponibles del ' + entradaFormatted + ' al ' + salidaFormatted + ' (' + dias + ' noches):\n\n' + lines.join("\n") + '\n\n¿Te gustaría reservar? Contactanos al ' + hotelInfo.telefono + '.';
  }

  return null;
}

async function handleFlow(message, req) {
  var lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (req.session.chatbotFlow) {
    if (Date.now() - req.session.chatbotFlow.startedAt > 300000) {
      delete req.session.chatbotFlow;
      return "La conversación ha expirado. Seleccioná 'Disponibilidad' en el menú para empezar de nuevo.";
    }
    var flowReply = await processFlowStep(req.session.chatbotFlow, message);
    if (flowReply === null || req.session.chatbotFlow._done) {
      delete req.session.chatbotFlow;
      if (flowReply === null) return "Seleccioná una opción:";
      if (typeof flowReply === "object") return flowReply;
      return { reply: flowReply };
    }
    return flowReply;
  }

  if (/^(disponibilidad|disponibilidad\s*\d*)$/.test(lower)) {
    req.session.chatbotFlow = { step: "tipo", startedAt: Date.now() };
    return { reply: "¿Qué tipo de habitación te interesa?\n\n1 → Matrimonial\n2 → Semi Suite\n3 → Suite Junior\n4 → Suite\n5 → Suite VIP\n\nIngresá el número correspondiente:", showMenu: false };
  }

  return null;
}

const chatbotMessage = async (req, res) => {
  try {
    var message = req.body && req.body.message;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.json({ reply: "Por favor, escribe un mensaje para poder ayudarte." });
    }

    var trimmed = message.trim();

    var flowReply = await handleFlow(trimmed, req);
    if (flowReply) {
      if (typeof flowReply === "object") return res.json(flowReply);
      return res.json({ reply: flowReply });
    }

    var intent = detectIntent(trimmed);

    if (!intent) {
      return res.json({
        reply: 'No entendí tu mensaje. Puedo ayudarte con horarios, dirección, teléfono, servicios, tipos de habitación, precios, disponibilidad y promociones. Escribe "ayuda" para ver todas las opciones.',
      });
    }

    var reply = await intent.handler(trimmed);
    return res.json({ reply: reply });
  } catch (err) {
    console.error("Error en chatbotMessage:", err);
    return res.status(500).json({ reply: "Ocurrió un error interno. Por favor, intenta de nuevo más tarde." });
  }
};

module.exports = { chatbotMessage };
