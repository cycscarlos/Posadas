const { query } = require("../database/db.js");
const { verifyPassword } = require("../utils/password.js");

// Ruta para mostrar el formulario de login
exports.login = (req, res) => {
  res.render("login");
};

// Función para ingresar un usuario en la BDD
exports.ingresar = async (req, res) => {
  const { username, clave } = req.body;

  // Registrar intento de login para seguridad
  const clientIP = req.ip || req.connection.remoteAddress;
  console.log(`Intento de inicio de sesión: ${username} desde ${clientIP}`);

  if (!username || !clave) {
    return res.render("login", {
      alert: true,
      alertTitle: "Advertencia",
      alertMessage: "Por favor, ingrese un usuario y clave para iniciar",
      alertIcon: "warning",
      showConfirmButton: true,
      timer: 3000,
      ruta: "login",
    });
  }

  try {
    // Consulta solo el usuario, sin verificar la contraseña en la consulta
    const sql = "SELECT * FROM login WHERE username = ?";
    const results = await query(sql, [username]);

    if (results.length === 0) {
      console.log(`Intento fallido: usuario ${username} no encontrado`);
      return res.render("login", {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Usuario o contraseña incorrectos.",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
        ruta: "login",
      });
    }

    const user = results[0];

    // Verificar la contraseña hasheada
    const isValidPassword = await verifyPassword(clave, user.clave);

    if (!isValidPassword) {
      console.log(`Intento fallido: contraseña incorrecta para ${username}`);
      return res.render("login", {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Usuario o contraseña incorrectos.",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
        ruta: "login",
      });
    }

    // Si llegamos aquí, el login fue exitoso
    if (req.loginSuccess) {
      req.loginSuccess(); // Notificar al limitador de tasa que el login fue exitoso
    }

    // Regenerar la sesión para prevenir ataques de fijación de sesión
    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Configurar la sesión en la nueva sesión regenerada
    req.session.loggedin = true;
    req.session.name = user.fullname;
    req.session.userId = user.id;
    console.log(`ID del usuario autenticado: ${req.session.userId}`);
    req.session.role = user.rol;
    console.log(`Rol del usuario autenticado: ${req.session.role}`);

    console.log(
      `Login exitoso: ${username} (ID: ${user.id}, Rol: ${user.rol})`
    );

    // Verificar el rol del usuario
    if (req.session.role !== "admin" && req.session.role !== "data entry") {
      return res.render("login", {
        alert: true,
        alertTitle: "Acceso Denegado",
        alertMessage: "No tienes permiso para acceder a esta área.",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
        ruta: "login",
      });
    }

    // Actualizar último login
    await query(
      "UPDATE login SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id]
    );

    // Redirigir a la página de menú
    return res.redirect("/menu");
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return res.render("login", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Error en la base de datos.",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
      ruta: "login",
    });
  }
};
