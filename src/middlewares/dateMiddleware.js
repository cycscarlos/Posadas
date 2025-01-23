// middleware/dateMiddleware.js
const {
  formatDateToDDMMYYYY,
  formatDateToYYYYMMDD,
  validateDate,
} = require("../utils/dateUtils");

// Middleware para formatear fechas en las respuestas
const formatDatesInResponse = (req, res, next) => {
  if (res.locals.data) {
    res.locals.data.forEach((item) => {
      if (item.fecha_entrada)
        item.fecha_entrada = formatDateToDDMMYYYY(item.fecha_entrada);
      if (item.fecha_salida)
        item.fecha_salida = formatDateToDDMMYYYY(item.fecha_salida);
    });
  }
  next();
};

// Middleware para validar y formatear fechas en las solicitudes
const validateAndFormatDatesInRequest = (req, res, next) => {
  const { fecha_entrada, fecha_salida } = req.body;
  const today = new Date().toISOString().split("T")[0];

  if (fecha_entrada && fecha_salida) {
    if (!validateDate(fecha_entrada) || !validateDate(fecha_salida)) {
      return res.status(400).json({ error: "Fechas inválidas" });
    }
    const formattedFechaEntrada = formatDateToYYYYMMDD(fecha_entrada);
    const formattedFechaSalida = formatDateToYYYYMMDD(fecha_salida);

    if (formattedFechaEntrada < today) {
      return res
        .status(400)
        .json({
          error:
            "La fecha de entrada debe ser igual o mayor a la fecha del sistema",
        });
    }

    req.body.fecha_entrada = formattedFechaEntrada;
    req.body.fecha_salida = formattedFechaSalida;
  }
  next();
};

module.exports = {
  formatDatesInResponse,
  validateAndFormatDatesInRequest,
};
