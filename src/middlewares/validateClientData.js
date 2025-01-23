// Validación de campos obligatorios
const validateClientData = (data) => {
  const requiredFields = [
    "nombre",
    "apellido",
    "cedula",
    "correo",
    "telefono",
    "procedencia",
    "personas",
    "habitacion",
    "entrada",
    "salida",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      return `${field} es obligatorio`;
    }
  }
  return null;
};

// Asegúrate de exportar la función
module.exports = validateClientData;
