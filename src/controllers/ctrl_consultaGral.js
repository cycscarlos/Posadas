// controller.js
const { query } = require("../database/db.js");
const { formatDatesInResponse } = require("../middlewares/dateMiddleware");

function formatCedula(val) {
  if (!val) return val;
  var m = val.match(/^([VEve]-)?(\d+)$/);
  if (!m) return val;
  var prefix = m[1] || '';
  var num = m[2].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return prefix + num;
}

function formatTelefono(val) {
  if (!val) return val;
  var code = '';
  var num = val;
  if (val.indexOf('+58') === 0) { code = '+58'; num = val.slice(3); }
  else if (val.indexOf('+1') === 0) { code = '+1'; num = val.slice(2); }
  var formatted = '';
  if (code === '+58') {
    if (num.charAt(0) !== '0') num = '0' + num;
    for (var i = 0; i < num.length; i++) {
      if (i === 4 || i === 7 || i === 9) formatted += '.';
      formatted += num[i];
    }
    return '(' + code + ') ' + formatted;
  }
  if (code === '+1') {
    for (var i = 0; i < num.length; i++) {
      if (i === 3 || i === 6) formatted += '.';
      formatted += num[i];
    }
    return '(' + code + ') ' + formatted;
  }
  for (var i = 0; i < num.length; i++) {
    if (i === 4 || i === 7 || i === 9) formatted += '.';
    formatted += num[i];
  }
  return formatted;
}

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
      res.locals.data = results.map(function(row) {
        return {
          id_cliente: row.id_cliente,
          cedula: formatCedula(row.cedula),
          nombre: row.nombre,
          apellido: row.apellido,
          telefono: formatTelefono(row.telefono),
          correo: row.correo,
          procedencia: row.procedencia,
          personas: row.personas,
          id_habitacion: row.id_habitacion,
          fecha_entrada: row.fecha_entrada,
          fecha_salida: row.fecha_salida,
        };
      });
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
