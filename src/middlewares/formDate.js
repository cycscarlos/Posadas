// Cambiar de formato las fechas a dd-mm-aaaa
function formDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses de 0-11
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// exportar la función
module.exports = formDate;
