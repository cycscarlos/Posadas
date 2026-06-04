const { query } = require("../database/db.js");

const authenticate = async (req, res, next) => {
  const userId = req.session.userId; // Asumiendo que guardas el ID del usuario en la sesión
  console.log(`ID del usuario en la sesión: ${userId}`);  

  if (!userId) {
    return res.render('login', {
      alert: true,
      alertTitle: 'Error',
      alertMessage: 'No autenticado',
      alertIcon: 'error',
      showConfirmButton: true,
      timer: 3000,
      ruta: 'login',
    });
  }

  try {
    const [user] = await query("SELECT * FROM login WHERE id = ?", [userId]);

    console.log(`Usuario encontrado: ID=${user.id}, username=${user.username}, role=${user.rol}`);
    if (!user) {
      return res.render('login', {
        alert: true,
        alertTitle: 'Error',
        alertMessage: 'Usuario no encontrado',
        alertIcon: 'error',
        showConfirmButton: true,
        timer: 3000,
        ruta: 'login',
      });
    }

    req.user = user; // Agregar el usuario a la solicitud
    next(); // Continuar al siguiente middleware o ruta
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return res.render('login', {
      alert: true,
      alertTitle: 'Error',
      alertMessage: 'Error en la autenticación',
      alertIcon: 'error',
      showConfirmButton: true,
      timer: 3000,
      ruta: 'login',
    });
  }
};

module.exports = authenticate;
