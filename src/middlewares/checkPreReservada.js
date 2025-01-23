const { query } = require("../database/db.js");

const checkPreReservada = async (req, res, next) => {
  try {
    const preReservadas = await query(`
      SELECT id_cliente, id_habitacion 
      FROM reservas 
      WHERE estado = 'pre-reservada'
    `);
    console.log("middleware: ", preReservadas);
    req.preReservadas = preReservadas.map((reserva) => reserva.id_cliente);
    next();
  } catch (error) {
    console.error("Error al verificar pre-reservadas: ", error);
    res.status(500).send("Error al verificar pre-reservadas");
  }
};

module.exports = checkPreReservada;
