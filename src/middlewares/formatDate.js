// Función para formatear las fechas
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0'); // Obtener el día y agregar un 0 si es necesario
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtener el mes (0-11) y agregar un 0 si es necesario
  const year = date.getFullYear(); // Obtener el año

  return `${day}/${month}/${year}`; // Formato dd/mm/aaaa
};

module.exports = {
  formatDate,
};
