// Configuración de la aplicación
// En entornos de producción, estas variables DEBEN configurarse en el entorno

// Detectar Railway automáticamente
const isRailway = !!process.env.RAILWAY_SERVICE_ID;

// Verificar si estamos en entorno de desarrollo
const isDevelopment = isRailway ? false : process.env.NODE_ENV !== "production";

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;

// Parsear DATABASE_URL (usado por Railway y otras plataformas)
function parseDatabaseUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "mysql:") return null;
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 3306,
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.replace(/^\//, ""),
    };
  } catch {
    return null;
  }
}

const dbFromUrl = parseDatabaseUrl(
  process.env.DATABASE_URL || process.env.MYSQL_URL
);

// Configuración de la base de datos (prioridad: DB_* > MYSQL_* > DATABASE_URL)
const DB_HOST = process.env.DB_HOST ||
  process.env.MYSQL_HOST ||
  (dbFromUrl ? dbFromUrl.host : undefined);
const DB_USER = process.env.DB_USER ||
  process.env.MYSQL_USER ||
  (dbFromUrl ? dbFromUrl.user : undefined);
const DB_PASSWORD = process.env.DB_PASSWORD ||
  process.env.MYSQL_PASSWORD ||
  (dbFromUrl ? dbFromUrl.password : undefined);
const DB_NAME = process.env.DB_NAME ||
  process.env.MYSQL_DATABASE ||
  (dbFromUrl ? dbFromUrl.database : undefined);
const DB_PORT = process.env.DB_PORT ||
  process.env.MYSQL_PORT ||
  (dbFromUrl ? dbFromUrl.port : undefined) ||
  3306;

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
  if (!process.env.DB_HOST && !process.env.MYSQL_HOST) {
    process.env.DB_HOST = "localhost";
    process.env.DB_USER = "root";
    process.env.DB_PASSWORD = "";
    process.env.DB_NAME = "posada_db";
  }

  console.log("Variables de entorno para desarrollo configuradas.");
}

// Configuración de sesión MySQL (para Railway)
const SESSION_TABLE = "sessions_railway";

module.exports = {
  PORT,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT,
  SESSION_SECRET,
  SESSION_TABLE,
  isDevelopment,
  isRailway,
};
