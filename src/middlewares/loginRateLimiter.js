/**
 * Limitador de tasa para prevenir ataques de fuerza bruta en el inicio de sesión.
 * Restringe el número de intentos de inicio de sesión por dirección IP.
 */
const { isDevelopment } = require("../config");

// Almacén de intentos de inicio de sesión (en memoria)
// En producción, considerar usar Redis u otro almacenamiento persistente
const loginAttempts = new Map();

// Configuración de límites
const MAX_ATTEMPTS = 5; // Número máximo de intentos permitidos
const WINDOW_MS = 15 * 60 * 1000; // Ventana de tiempo (15 minutos)
const BLOCK_DURATION_MS = 30 * 60 * 1000; // Duración del bloqueo (30 minutos)

/**
 * Middleware para limitar los intentos de inicio de sesión
 */
const loginRateLimiter = (req, res, next) => {
  // Solo aplicar en solicitudes POST (intentos de inicio de sesión)
  if (req.method !== "POST") {
    return next();
  }

  // Obtener la dirección IP del cliente
  const clientIP = req.ip || req.connection.remoteAddress;

  // Información del cliente actual
  const now = Date.now();
  const clientInfo = loginAttempts.get(clientIP) || {
    attempts: 0,
    firstAttempt: now,
    blockedUntil: 0,
  };

  // Comprobar si el cliente está bloqueado
  if (clientInfo.blockedUntil > now) {
    const remainingMinutes = Math.ceil(
      (clientInfo.blockedUntil - now) / (60 * 1000)
    );

    console.log(
      `Intento de inicio de sesión bloqueado para IP ${clientIP} (bloqueado por ${remainingMinutes} minutos más)`
    );

    return res.render("login", {
      alert: true,
      alertTitle: "Acceso bloqueado",
      alertMessage: `Demasiados intentos fallidos. Por favor, intente nuevamente después de ${remainingMinutes} minutos.`,
      alertIcon: "error",
      showConfirmButton: true,
      timer: 5000,
      ruta: "login",
    });
  }

  // Reiniciar contador si ha pasado el tiempo de la ventana
  if (now - clientInfo.firstAttempt > WINDOW_MS) {
    clientInfo.attempts = 0;
    clientInfo.firstAttempt = now;
  }

  // Actualizar información del cliente
  clientInfo.attempts += 1;
  loginAttempts.set(clientIP, clientInfo);

  // Bloquear si se exceden los intentos
  if (clientInfo.attempts > MAX_ATTEMPTS) {
    clientInfo.blockedUntil = now + BLOCK_DURATION_MS;
    loginAttempts.set(clientIP, clientInfo);

    console.log(`IP bloqueada por muchos intentos fallidos: ${clientIP}`);

    return res.render("login", {
      alert: true,
      alertTitle: "Acceso bloqueado",
      alertMessage:
        "Demasiados intentos fallidos. Por favor, intente nuevamente más tarde.",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 5000,
      ruta: "login",
    });
  }

  // Si es un intento exitoso (se verificará en el controlador)
  // necesitamos un mecanismo para reiniciar el contador
  // Esto se puede hacer agregando una función en el objeto req
  req.loginSuccess = () => {
    loginAttempts.delete(clientIP);
  };

  // Registrar intentos en desarrollo
  if (isDevelopment) {
    console.log(
      `Intento de inicio de sesión ${clientInfo.attempts}/${MAX_ATTEMPTS} para IP: ${clientIP}`
    );
  }

  next();
};

// Limpiar la caché de intentos periódicamente para evitar fugas de memoria
setInterval(() => {
  const now = Date.now();
  loginAttempts.forEach((info, ip) => {
    // Eliminar entradas antiguas (más de 1 hora) que no estén bloqueadas
    if (now - info.firstAttempt > 3600000 && info.blockedUntil < now) {
      loginAttempts.delete(ip);
    }
  });
}, 3600000); // Limpiar cada hora

module.exports = loginRateLimiter;
