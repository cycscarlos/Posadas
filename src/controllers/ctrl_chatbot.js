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

const intents = [
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
          "SELECT DISTINCT tipo_habitacion, capacidad, precio FROM habitaciones ORDER BY precio"
        );
        if (!rows || rows.length === 0) {
          return "Actualmente no tenemos información de habitaciones disponible. Por favor, contáctanos directamente.";
        }
        const lines = rows.map((r) => {
          const precio = r.precio
            ? `Bs. ${Number(r.precio).toLocaleString("es-VE")}`
            : "Consultar";
          return `• ${r.tipo_habitacion} — ${r.capacidad} pers. — ${precio}`;
        });
        return `Estos son los tipos de habitación disponibles:\n${lines.join("\n")}\n\nLos precios pueden variar según temporada. Contáctanos para más información.`;
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
          "SELECT tipo_habitacion, capacidad, precio FROM habitaciones WHERE precio IS NOT NULL ORDER BY precio"
        );
        if (!rows || rows.length === 0) {
          return "Actualmente no tenemos precios registrados. Por favor, contáctanos directamente para más información.";
        }
        const lines = rows.map((r) => {
          const precio = Number(r.precio).toLocaleString("es-VE");
          return `• ${r.tipo_habitacion} (${r.capacidad} pers.) — Bs. ${precio}`;
        });
        return `Estos son nuestros precios por noche:\n${lines.join("\n")}\n\nLos precios pueden variar según temporada. Escríbenos para confirmar disponibilidad y tarifas actualizadas.`;
      } catch (err) {
        console.error("Error en chatbot consulta precios:", err);
        return "Ocurrió un error al consultar los precios. Intenta de nuevo más tarde.";
      }
    },
  },
  {
    name: "disponibilidad",
    patterns: [/disponible/, /hay habitación/, /hay habitacion/, /hay cupo/, /cupo/, /hoy/, /mañana/, /mañana/, /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/],
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
           AND h.estado = 'disponible'
           ORDER BY h.tipo_habitacion`,
          [fechaSalida, fechaEntrada]
        );

        if (!rows || rows.length === 0) {
          return `Lo siento, no tenemos habitaciones disponibles para la fecha indicada. Puedes contactarnos al ${hotelInfo.telefono} para consultar otras opciones.`;
        }

        const lines = rows.map((r) => {
          const precio = r.precio
            ? `Bs. ${Number(r.precio).toLocaleString("es-VE")}`
            : "Consultar";
          return `• Hab. ${r.id_habitacion} — ${r.tipo_habitacion} (${r.capacidad} pers.) — ${precio}`;
        });
        return `Habitaciones disponibles para el día solicitado:\n${lines.join("\n")}\n\n¿Te gustaría reservar alguna? Contáctanos al ${hotelInfo.telefono} o visita nuestras instalaciones.`;
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
             AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
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
    handler: () => `Puedo ayudarte con la siguiente información:\n• Horarios de check-in / check-out\n• Dirección y contacto\n• Servicios del hotel\n• Tipos de habitación y capacidades\n• Precios por noche\n• Disponibilidad de habitaciones (indícame una fecha)\n• Promociones activas\n\n¿Sobre qué te gustaría saber?`,
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

const chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.json({ reply: "Por favor, escribe un mensaje para poder ayudarte." });
    }

    const trimmed = message.trim();
    const intent = detectIntent(trimmed);

    if (!intent) {
      return res.json({
        reply: `No entendí tu mensaje. Puedo ayudarte con horarios, dirección, teléfono, servicios, tipos de habitación, precios, disponibilidad y promociones. Escribe "ayuda" para ver todas las opciones.`,
      });
    }

    const reply = await intent.handler(trimmed);
    return res.json({ reply });
  } catch (err) {
    console.error("Error en chatbotMessage:", err);
    return res.status(500).json({ reply: "Ocurrió un error interno. Por favor, intenta de nuevo más tarde." });
  }
};

module.exports = { chatbotMessage };
