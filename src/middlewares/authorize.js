const { query } = require("../database/db.js");

const authorize = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      console.log('Usuario no autenticado');
      return res.render('login', {
        alert: true,
        alertTitle: 'Error',
        alertMessage: 'No autorizado',
        alertIcon: 'error',
        showConfirmButton: true,
        timer: 3000,
        ruta: 'login',
      });
    }

    const userRole = req.user.rol; // Obtener el rol del usuario
    console.log(`Rol del usuario: ${userRole}`);
    console.log(`Roles permitidos: ${roles}`);

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (roles.includes(userRole)) {
      console.log(`Acceso permitido para el rol: ${userRole}`);
      next(); // Permitir el acceso
    } else {
      console.log(`Acceso denegado para el rol: ${userRole}`);
      return res.render('login', {
        alert: true,
        alertTitle: 'Acceso Denegado',
        alertMessage: 'No tienes permiso para acceder a esta área.',
        alertIcon: 'error',
        showConfirmButton: true,
        timer: 3000,
        ruta: 'login',
      });
    }
  };
};

module.exports = authorize;
