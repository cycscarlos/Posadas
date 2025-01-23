const formatCedula = (cedula) => {
  const reversedCedula = cedula.toString().split('').reverse().join('');
  const formattedCedula = reversedCedula
    .match(/.{1,3}/g)
    .join('.')
    .split('')
    .reverse()
    .join('');
  return formattedCedula;
};

const formatTelefono = (telefono) => {
  const telefonoStr = telefono.toString();

  // Obtener los primeros 3 dígitos (operadora) y los siguientes 3 (código de área)
  const codigoOperadora = telefonoStr.slice(0, 3);
  const codigoArea = telefonoStr.slice(3, 6);
  const resto = telefonoStr.slice(6);

  // Separar el resto en pares de dígitos
  const formattedResto = resto.match(/.{1,2}/g).join('.');

  return `${codigoOperadora}.${codigoArea}.${formattedResto}`;
};

// Middleware para formatear cédula y teléfono
const formatFields = (req, res, next) => {
  if (req.body.cedula) {
    req.body.cedula = formatCedula(req.body.cedula);
  }

  if (req.body.telefono) {
    req.body.telefono = formatTelefono(req.body.telefono);
  }

  next();
};

// Exportar las funciones y el middleware
module.exports = {
  formatFields,
  formatCedula,
  formatTelefono,
};
