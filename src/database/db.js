const mysql = require("mysql");
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
} = require("../config.js");

// Solo verificar si estamos en producción
if (process.env.NODE_ENV === "production") {
  if (
    !process.env.DB_HOST ||
    !process.env.DB_USER ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_NAME
  ) {
    console.warn(
      "ADVERTENCIA: Algunas variables de entorno para la base de datos no están configuradas en producción."
    );
  }
}

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Evitar problemas de conversión de tipos
  typeCast: function (field, next) {
    if (field.type === "TINY" && field.length === 1) {
      return field.string() === "1"; // Convertir a booleano
    }
    return next();
  },
});

// Comprobar conexión al iniciar
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Se perdió la conexión con la base de datos.");
    } else if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("La base de datos tiene demasiadas conexiones.");
    } else if (err.code === "ECONNREFUSED") {
      console.error("La conexión a la base de datos fue rechazada.");
    } else {
      console.error("Error de conexión a la base de datos:", err);
    }
    return;
  }
  console.log("¡Conexión a la base de datos establecida correctamente!");
  connection.release();
});

// Función para ejecutar consultas SQL
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

// Función para obtener una conexión del pool para transacciones
const getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      resolve(connection);
    });
  });
};

// Función para ejecutar una transacción
const transaction = async (callback) => {
  const connection = await getConnection();
  try {
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const result = await callback(connection);

    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    return result;
  } catch (error) {
    await new Promise((resolve) => {
      connection.rollback(() => resolve());
    });
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  getConnection,
  transaction,
};
