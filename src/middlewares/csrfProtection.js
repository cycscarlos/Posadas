const crypto = require('crypto');

const generateToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

const validateToken = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    if (token && token !== req.session.csrfToken) {
      return res.status(403).render('login', {
        alert: true,
        alertTitle: 'Error',
        alertMessage: 'Token CSRF inválido. Intente nuevamente.',
        alertIcon: 'error',
        showConfirmButton: true,
        timer: 3000,
        ruta: 'login',
      });
    }
  }
  next();
};

module.exports = { generateToken, validateToken };
