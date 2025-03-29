const { query } = require("../database/db.js");
const { hashPassword } = require("../utils/password.js");

// Función para registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  const { username, password, fullname, correo, rol } = req.body;

  try {
    // Verificar si el usuario ya existe
    const [existingUser] = await query(
      "SELECT * FROM login WHERE username = ?",
      [username]
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya está en uso",
      });
    }

    // Verificar si el correo ya está en uso
    if (correo) {
      const [existingEmail] = await query(
        "SELECT * FROM login WHERE correo = ?",
        [correo]
      );
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico ya está en uso",
        });
      }
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await hashPassword(password);

    // Insertar el nuevo usuario en la base de datos
    await query(
      "INSERT INTO login (username, clave, fullname, correo, rol, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
      [username, hashedPassword, fullname, correo, rol]
    );

    // Devolver una respuesta JSON
    res.json({ success: true, message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al registrar usuario" });
  }
};

// Función para actualizar un usuario
exports.updateUser = async (req, res) => {
  const { username, fullname, correo, rol, password } = req.body;
  const userId = req.params.id;

  try {
    const [existingUser] = await query("SELECT * FROM login WHERE id = ?", [
      userId,
    ]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el nuevo username ya está en uso por otro usuario
    if (username !== existingUser.username) {
      const [userWithSameUsername] = await query(
        "SELECT * FROM login WHERE username = ? AND id != ?",
        [username, userId]
      );

      if (userWithSameUsername) {
        return res.status(400).json({
          success: false,
          message: "El nombre de usuario ya está en uso por otro usuario",
        });
      }
    }

    // Verificar si el nuevo correo ya está en uso por otro usuario
    if (correo !== existingUser.correo) {
      const [userWithSameEmail] = await query(
        "SELECT * FROM login WHERE correo = ? AND id != ?",
        [correo, userId]
      );

      if (userWithSameEmail) {
        return res.status(400).json({
          success: false,
          message: "El correo electrónico ya está en uso por otro usuario",
        });
      }
    }

    // Comprobar si se necesitan cambios
    const updatedFields = [];
    const values = [];

    if (username !== existingUser.username) {
      updatedFields.push("username = ?");
      values.push(username);
    }

    if (fullname !== existingUser.fullname) {
      updatedFields.push("fullname = ?");
      values.push(fullname);
    }

    if (correo !== existingUser.correo) {
      updatedFields.push("correo = ?");
      values.push(correo);
    }

    if (rol !== existingUser.rol) {
      updatedFields.push("rol = ?");
      values.push(rol);
    }

    if (password) {
      // Hashear la contraseña si se está actualizando
      const hashedPassword = await hashPassword(password);
      updatedFields.push("clave = ?");
      values.push(hashedPassword);
    }

    // Si no hay cambios
    if (updatedFields.length === 0) {
      return res.json({
        success: true,
        message: "No se realizaron cambios en el usuario.",
        value: { username, fullname, rol }, // Devolver los valores actuales
      });
    }

    // Construir y ejecutar la consulta
    const queryString = `UPDATE login SET ${updatedFields.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    values.push(userId);
    await query(queryString, values);

    // Devolver respuesta con los valores actualizados
    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      value: { username, fullname, rol },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario: " + error.message,
    });
  }
};

// Función para eliminar un usuario
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Verificar si el usuario existe
    const [user] = await query("SELECT * FROM login WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Prevenir la eliminación del último administrador
    if (user.rol === "admin") {
      const [adminCount] = await query(
        "SELECT COUNT(*) as count FROM login WHERE rol = 'admin'"
      );
      if (adminCount.count <= 1) {
        return res.status(400).json({
          success: false,
          message: "No se puede eliminar el último administrador del sistema",
        });
      }
    }

    // Eliminar el usuario de la base de datos
    await query("DELETE FROM login WHERE id = ?", [userId]);

    // Devolver una respuesta JSON
    res.json({ success: true, message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar usuario" });
  }
};

// Función para manejar el último inicio de sesión de un usuario
exports.handleLastLogin = async (req, res) => {
  const userId = req.params.id;

  try {
    // Verificar si el usuario existe
    const [user] = await query("SELECT * FROM login WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Actualizar el campo last_login en la base de datos
    await query(
      "UPDATE login SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Último inicio de sesión actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al manejar el último inicio de sesión:", error);
    res.status(500).json({
      success: false,
      message: "Error al manejar el último inicio de sesión",
    });
  }
};

// Función para obtener los datos de un usuario
exports.getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const results = await query(
      "SELECT id, username, fullname, correo, rol, created_at, updated_at, last_login FROM login WHERE id = ?",
      [userId]
    );
    if (results.length > 0) {
      const user = results[0];
      res.render("userManagement", { user });
    } else {
      res.status(404).render("error", {
        message: "Usuario no encontrado",
        error: { status: 404 },
      });
    }
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    res.status(500).render("error", {
      message: "Error al obtener los datos del usuario",
      error: { status: 500 },
    });
  }
};

// Función para obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const results = await query(
      "SELECT id, username, fullname, correo, rol, created_at, updated_at, last_login FROM login"
    );
    const users = results;
    res.render("userManagement", { users });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).render("error", {
      message: "Error al obtener los usuarios",
      error: { status: 500 },
    });
  }
};
