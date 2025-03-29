// Configuración de la aplicación
// En entornos de producción, estas variables DEBEN configurarse en el entorno

// Verificar si estamos en entorno de desarrollo (por defecto consideramos que sí)
const isDevelopment = process.env.NODE_ENV !== "production";

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT || 3306;

// Secreto para las sesiones
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (isDevelopment ? "desarrollo_secreto_inseguro" : "");

// Verificar configuración crítica
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  const missingEnvVars = [];
  if (!DB_HOST) missingEnvVars.push("DB_HOST");
  if (!DB_USER) missingEnvVars.push("DB_USER");
  if (!DB_PASSWORD) missingEnvVars.push("DB_PASSWORD");
  if (!DB_NAME) missingEnvVars.push("DB_NAME");

  if (isDevelopment) {
    console.warn(
      `ADVERTENCIA: Faltan variables de entorno importantes: ${missingEnvVars.join(
        ", "
      )}`
    );
    console.warn(
      "En desarrollo, se usarán valores predeterminados inseguros. Asegúrese de configurar estas variables en producción."
    );
  } else {
    console.error(
      `ERROR CRÍTICO: Faltan variables de entorno requeridas en producción: ${missingEnvVars.join(
        ", "
      )}`
    );
    process.exit(1); // Terminar la aplicación en producción si faltan variables críticas
  }
}

// En desarrollo, usar valores predeterminados si no están definidos
if (isDevelopment) {
  if (!DB_HOST) process.env.DB_HOST = "localhost";
  if (!DB_USER) process.env.DB_USER = "root";
  if (!DB_PASSWORD) process.env.DB_PASSWORD = "";
  if (!DB_NAME) process.env.DB_NAME = "posada_db";

  console.log("Variables de entorno para desarrollo configuradas.");
}

module.exports = {
  PORT,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT,
  SESSION_SECRET,
  isDevelopment,
};
