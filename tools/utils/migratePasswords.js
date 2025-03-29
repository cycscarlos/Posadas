/**
 * Script para migrar contraseñas en texto plano a hashes seguros con bcryptjs
 *
 * Este script debe ejecutarse una vez para actualizar todas las contraseñas existentes
 * cuando se implementa el sistema de hashing de contraseñas.
 */

// Cargar variables de entorno
require("dotenv").config({ path: "../../env/.env" });

// Establecer NODE_ENV en 'development' para usar valores por defecto en config.js
process.env.NODE_ENV = "development";

const { query } = require("../../src/database/db");
const { hashPassword } = require("../../src/utils/password");

/**
 * Migra todas las contraseñas en texto plano a hashes bcrypt
 */
async function migratePasswords() {
  try {
    console.log("🔐 Iniciando migración de contraseñas...");

    // Obtener todos los usuarios
    const users = await query("SELECT id, username, clave FROM login");
    console.log(`Se encontraron ${users.length} usuarios para migrar.`);

    let migrated = 0;
    let errors = 0;

    // Procesar cada usuario
    for (const user of users) {
      try {
        // Verificar si la contraseña ya está hasheada (las contraseñas bcrypt comienzan con $2a$, $2b$ o $2y$)
        if (
          user.clave &&
          (user.clave.startsWith("$2a$") ||
            user.clave.startsWith("$2b$") ||
            user.clave.startsWith("$2y$"))
        ) {
          console.log(
            `- Usuario ${user.username}: La contraseña ya está hasheada.`
          );
          continue;
        }

        // Hashear la contraseña
        const hashedPassword = await hashPassword(user.clave);

        // Actualizar la contraseña en la base de datos
        await query(
          "UPDATE login SET clave = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [hashedPassword, user.id]
        );

        console.log(
          `✅ Usuario ${user.username}: Contraseña migrada exitosamente.`
        );
        migrated++;
      } catch (userError) {
        console.error(
          `❌ Error al migrar usuario ${user.username}: ${userError.message}`
        );
        errors++;
      }
    }

    console.log("\n===== RESUMEN DE MIGRACIÓN =====");
    console.log(`Total de usuarios: ${users.length}`);
    console.log(`Contraseñas migradas exitosamente: ${migrated}`);
    console.log(`Errores: ${errors}`);

    if (errors === 0 && migrated > 0) {
      console.log("\n✅ Migración completada exitosamente!");
    } else if (errors === 0 && migrated === 0) {
      console.log(
        "\n✅ Todas las contraseñas ya estaban migradas correctamente."
      );
    } else {
      console.log("\n⚠️ La migración completó con errores. Revise los logs.");
    }
  } catch (error) {
    console.error("Error general durante la migración:", error);
  } finally {
    // Cerrar la conexión a la base de datos
    process.exit(0);
  }
}

// Ejecutar la migración
migratePasswords();
