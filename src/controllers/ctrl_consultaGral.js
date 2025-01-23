// controller.js
const { query } = require("../database/db.js");
const { formatDatesInResponse } = require("../middlewares/dateMiddleware");

// Ruta para obtener todos los registros en una consulta General de la BDD
exports.consulta = [
  async (req, res, next) => {
    try {
      const results = await query(`
        SELECT c.id_cliente, c.cedula, c.nombre, c.apellido, c.telefono, c.correo, c.procedencia, c.personas,
               r.fecha_entrada, r.fecha_salida,
               h.id_habitacion
        FROM clientes c
        LEFT JOIN reservas r ON c.id_cliente = r.id_cliente
        LEFT JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
      `);
      res.locals.data = results;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al obtener los registros: " + err.message);
    }
  },
  formatDatesInResponse,
  (req, res) => {
    res.render("consultaGral", { results: res.locals.data });
  },
];
