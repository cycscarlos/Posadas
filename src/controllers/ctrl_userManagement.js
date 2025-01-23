const { query } = require("../database/db.js");

// Función para registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  const { username, password, fullname, rol } = req.body;

  try {
    // Insertar el nuevo usuario en la base de datos
    await query(
      "INSERT INTO login (username, clave, fullname, rol) VALUES (?, ?, ?, ?)",
      [username, password, fullname, rol] // Guarda la contraseña en campo 'clave'
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
  const { username, fullname, rol, password } = req.body;
  const userId = req.params.id;

  try {
    const [existingUser] = await query("SELECT * FROM login WHERE id = ?", [userId]);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuario no encontrado" 
      });
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

    if (rol !== existingUser.rol) {
      updatedFields.push("rol = ?");
      values.push(rol);
    }

    if (password) {
      updatedFields.push("clave = ?");
      values.push(password);
    }

    // Si no hay cambios
    if (updatedFields.length === 0) {
      return res.json({
        success: true,
        message: "No se realizaron cambios en el usuario.",
        value: { username, fullname, rol } // Devolver los valores actuales
      });
    }

    // Construir y ejecutar la consulta
    const queryString = `UPDATE login SET ${updatedFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    values.push(userId);
    await query(queryString, values);

    // Devolver respuesta con los valores actualizados
    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
      value: { username, fullname, rol }
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar usuario: " + error.message
    });
  }
};

// Función para eliminar un usuario
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
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
    // Actualizar el campo last_login en la base de datos
    await query(
      "UPDATE login SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [userId]
    );

    res.status(200).send("Último inicio de sesión actualizado exitosamente");
  } catch (error) {
    console.error("Error al manejar el último inicio de sesión:", error);
    res.status(500).send("Error al manejar el último inicio de sesión");
  }
};

// Función para obtener los datos de un usuario
exports.getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const results = await query("SELECT * FROM login WHERE id = ?", [userId]);
    if (results.length > 0) {
      const user = results[0];
      res.render("userManagement", { user });
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    res.status(500).send("Error al obtener los datos del usuario");
  }
};

// Función para obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const results = await query("SELECT * FROM login");
    const users = results;
    res.render("userManagement", { users });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).send("Error al obtener los usuarios");
  }
};
