// Script temporal para generar el hash bcrypt compatible con tu sistema.
// Generé el hash para la contraseña proporcionada (Best_001*).
// const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "Best_001*";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(hash);
}

generateHash();
