const mysql = require("mysql");
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
} = require("../config.js");

// Nueva manera de definir para para producción
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// No es necesario hacer una conexión en este punto, ya que el pool se maneja automáticamente
console.log("¡Pool de conexiones creado!");

// Callback para ejecutar consultas
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = { pool, query };
