const { query } = require('../database/db.js');
const path = require('path');

// Ruta para mostrar el formulario de login
exports.login = (req, res) => {
  res.render('login');
};

// Función para ingresar un usuario en la BDD
exports.ingresar = async (req, res) => {
  const { username, clave } = req.body;

  if (username && clave) {
    const sql = 'SELECT * FROM login WHERE username = ? AND clave = ?';

    try {
      const results = await query(sql, [username, clave]);

      if (results.length > 0) {
        if (req.session) {
          req.session.loggedin = true;
          req.session.name = results[0].fullname;
          req.session.userId = results[0].id;
          console.log(`ID del usuario autenticado: ${req.session.userId}`);
          req.session.role = results[0].rol; // Asumiendo que el rol está en la base de datos
          console.log(`Rol del usuario autenticado: ${req.session.role}`);

          // Verificar el rol del usuario
          if (req.session.role !== 'admin' && req.session.role !== 'data entry') {
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

          // Redirigir a la página de menú si el rol es admin
          return res.redirect('/menu');
        } else {
          console.error('Session is undefined');
          return res.render('login', {
            alert: true,
            alertTitle: 'Error',
            alertMessage: 'Error de sesión. Por favor intente nuevamente.',
            alertIcon: 'error',
            showConfirmButton: true,
            timer: 3000,
            ruta: 'login',
          });
        }
      } else {
        return res.render('login', {
          alert: true,
          alertTitle: 'Error',
          alertMessage: 'Usuario o contraseña incorrectos.',
          alertIcon: 'error',
          showConfirmButton: true,
          timer: 3000,
          ruta: 'login',
        });
      }
    } catch (error) {
      console.error('Error en la consulta:', error);
      return res.render('login', {
        alert: true,
        alertTitle: 'Error',
        alertMessage: 'Error en la base de datos.',
        alertIcon: 'error',
        showConfirmButton: true,
        timer: 3000,
        ruta: 'login',
      });
    }
  } else {
    return res.render('login', {
      alert: true,
      alertTitle: 'Advertencia',
      alertMessage: 'Por favor, ingrese un usuario y clave para iniciar',
      alertIcon: 'warning',
      showConfirmButton: true,
      timer: 3000,
      ruta: 'login',
    });
  }
};
