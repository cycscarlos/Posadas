const bcrypt = require("bcryptjs");

/**
 * Genera un hash de contraseña utilizando bcryptjs
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Hash de la contraseña
 */
exports.hashPassword = async (password) => {
  // Generamos un salt con factor de costo 10 (equilibrio entre seguridad y rendimiento)
  const salt = await bcrypt.genSalt(10);
  // Hasheamos la contraseña con el salt generado
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * Verifica si una contraseña coincide con un hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} True si la contraseña es correcta
 */
exports.verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
