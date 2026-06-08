const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const morgan = require("morgan");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const cron = require("node-cron");
const helmet = require("helmet");

// Configuración de variables de entorno - DEBE SER PRIMERO
dotenv.config({ path: path.join(__dirname, "env", ".env") });

// Importaciones
const { PORT, SESSION_SECRET, isDevelopment } = require("./src/config.js");
const mainRouter = require("./src/router.js"); // Renombrado para mayor claridad
const {
  automatizacionEstados,
  executeOnServerStart,
} = require("./src/middlewares/automatizacionEstados.js");
const checkServerDBRoute = require("./src/routes/checkServerDB");
const homeRoute = require("./src/routes/home");

// Verificación del SECRET para las sesiones
if (
  !SESSION_SECRET ||
  (SESSION_SECRET === "desarrollo_secreto_inseguro" && !isDevelopment)
) {
  console.error(
    "ERROR: SESSION_SECRET no está configurado correctamente en el entorno."
  );
  console.error(
    "Debe establecer una cadena aleatoria segura en la variable de entorno SESSION_SECRET."
  );
  console.error(
    "En producción, este valor NO DEBE ser el valor predeterminado."
  );

  if (!isDevelopment) {
    process.exit(1); // Terminar la aplicación en producción si falta el SESSION_SECRET
  }
}

// Configuración de Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

// Sanitización de inputs (anti-XSS)
const sanitizeInput = require("./src/middlewares/sanitizeInput");
app.use(sanitizeInput);

// Middlewares de seguridad
// Helmet ayuda a proteger contra vulnerabilidades web configurando cabeceras HTTP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://use.fontawesome.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://use.fontawesome.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://use.fontawesome.com", "https://cdnjs.cloudflare.com", "data:"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  })
);

// Configuración de sesiones con mayor seguridad
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Mejor para GDPR y evita crear sesiones vacías
    cookie: {
      httpOnly: true, // Previene acceso a la cookie desde JavaScript (XSS)
      secure: !isDevelopment, // Cookies seguras solo en producción (HTTPS)
      maxAge: 3600000, // Sesión expira en 1 hora (en milisegundos)
      sameSite: "lax", // Ayuda a prevenir CSRF
    },
  })
);

// Protección CSRF
const { generateToken, validateToken } = require("./src/middlewares/csrfProtection");
app.use(generateToken);
app.use(validateToken);

// Limitador de tasa para intentos de inicio de sesión
const loginLimiter = require("./src/middlewares/loginRateLimiter");
app.use("/login", loginLimiter);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");

  // Establecer cabeceras de seguridad adicionales
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
});
app.use(morgan("tiny"));

// Rutas (ORDEN CRUCIAL)
app.use("/", checkServerDBRoute); // Verificación de la base de datos (PRIMERO)
app.use("/", homeRoute); // Ruta para la página principal (SEGUNDO)
app.use("/", mainRouter); // Rutas principales de la aplicación (DESPUÉS)

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render("error", {
    message: "Página no encontrada",
    error: { status: 404 },
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render("error", {
    message: isDevelopment ? err.message : "Error en el servidor",
    error: isDevelopment ? err : { status: statusCode },
  });
});

// Ejecutar la automatización al iniciar el servidor
app.listen(PORT, async () => {
  console.log(`${green}El servidor local es http://localhost:${PORT}${reset}`);

  // Ejecutar la automatización al iniciar el servidor
  await executeOnServerStart();

  // Programar la automatización para ejecutarse cada hora en punto
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const diaYHora = now.toLocaleString("es-ES", {
        timeZone: "America/Caracas", // Ajustar al huso horario correcto
      });

      console.log(
        JSON.stringify({
          level: "info",
          message: `Ejecutando automatización de estados.. ${diaYHora}`,
        })
      );

      await automatizacionEstados();

      console.log(
        JSON.stringify({
          level: "info",
          message: `Automatización de estados completada ${diaYHora}`,
        })
      );
    } catch (error) {
      console.error("Error en automatizacionEstados:", error);
    }
  });
});

// Colores para la consola
const green = "\x1b[32m";
const reset = "\x1b[0m";
