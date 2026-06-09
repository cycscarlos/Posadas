// middleware/dateMiddleware.js
const {
  formatDateToDDMMYYYY,
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
  const entrada = req.body.entrada || req.body.fecha_entrada;
  const salida = req.body.salida || req.body.fecha_salida;

  if (entrada && salida) {
    const dateEntrada = new Date(entrada + 'T12:00:00');
    const dateSalida = new Date(salida + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(dateEntrada) || isNaN(dateSalida)) {
      return res.status(400).json({ error: "Formato de fecha inválido" });
    }

    if (dateEntrada < today) {
      return res.status(400).json({ error: "La fecha de entrada debe ser igual o mayor a la fecha del sistema" });
    }

    if (dateSalida <= dateEntrada) {
      return res.status(400).json({ error: "La fecha de salida debe ser posterior a la fecha de entrada" });
    }
  }
  next();
};

module.exports = {
  formatDatesInResponse,
  validateAndFormatDatesInRequest,
};
