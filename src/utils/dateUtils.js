// utils/dateUtils.js
const formatDateToDDMMYYYY = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses de 0-11
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateToYYYYMMDD = (dateStr) => {
  const dateParts = dateStr.split("/");
  return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
};

const validateDate = (dateStr) => {
  const dateParts = dateStr.split("/");
  const year = parseInt(dateParts[2], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Meses son 0-based
  const day = parseInt(dateParts[0], 10);
  const date = new Date(year, month, day);
  return !isNaN(date.getTime());
};

module.exports = {
  formatDateToDDMMYYYY,
  formatDateToYYYYMMDD,
  validateDate,
};
