// Configuración de la aplicación
// En entornos de producción, estas variables DEBEN configurarse en el entorno

// Verificar si estamos en entorno de desarrollo (por defecto consideramos que sí)
const isDevelopment = process.env.NODE_ENV !== "production";

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
// Restaurando las credenciales originales para desarrollo
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "cycscarlos";
const DB_PASSWORD = process.env.DB_PASSWORD || "Best_001*";
const DB_NAME = process.env.DB_NAME || "posada_db";
const DB_PORT = process.env.DB_PORT || 3306;

// Verificar configuración crítica en producción
if (!isDevelopment) {
  const missingEnvVars = [];
  if (!process.env.DB_HOST) missingEnvVars.push("DB_HOST");
  if (!process.env.DB_USER) missingEnvVars.push("DB_USER");
  if (!process.env.DB_PASSWORD) missingEnvVars.push("DB_PASSWORD");
  if (!process.env.DB_NAME) missingEnvVars.push("DB_NAME");

  if (missingEnvVars.length > 0) {
    console.error(
      `ADVERTENCIA: Las siguientes variables de entorno no están configuradas en producción: ${missingEnvVars.join(
        ", "
      )}`
    );
  }
}

module.exports = {
  PORT,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
};
