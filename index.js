const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const morgan = require("morgan");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const cron = require("node-cron");

// Importaciones
const { PORT } = require("./src/config.js");
const mainRouter = require("./src/router.js"); // Renombrado para mayor claridad
const {
  automatizacionEstados,
  executeOnServerStart,
} = require("./src/middlewares/automatizacionEstados.js");
const checkServerDBRoute = require("./src/routes/checkServerDB");
const homeRoute = require("./src/routes/home");

// Configuración de variables de entorno
dotenv.config({ path: path.join(__dirname, "env", ".env") });

// Configuración de Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

// Middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  next();
});
app.use(morgan("tiny"));

// Rutas (ORDEN CRUCIAL)
app.use("/", checkServerDBRoute); // Verificación de la base de datos (PRIMERO)
app.use("/", homeRoute); // Ruta para la página principal (SEGUNDO)
app.use("/", mainRouter); // Rutas principales de la aplicación (DESPUÉS)

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
