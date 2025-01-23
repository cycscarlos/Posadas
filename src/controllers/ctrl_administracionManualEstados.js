const { query } = require("../database/db.js");

// Función para obtener todas las habitaciones y reservas
const getAllRoomsAndReservations = async () => {
  const rooms = await query(`SELECT * FROM habitaciones`);
  const reservations = await query(`SELECT * FROM reservas`);
  return { rooms, reservations };
};

// Función Original para actualizar el estado de una habitación
// const updateRoomStatus = async (id_habitacion, estado) => {
//   try {
//     console.log(`Updating room ${id_habitacion} to state ${estado}`);
//     await query(`UPDATE habitaciones SET estado = ? WHERE id_habitacion = ?`, [
//       estado,
//       id_habitacion,
//     ]);
//   } catch (error) {
//     throw error;
//   }
// };

// 2da. función de prueba con console logs incluidos
// const updateRoomStatus = async (id_habitacion, estado) => {
//   try {
//     console.log(`Updating room ${id_habitacion} to state ${estado}`);
//     const result = await query(
//       `UPDATE habitaciones SET estado = ? WHERE id_habitacion = ?`,
//       [estado, id_habitacion]
//     );
//     console.log(result); // Log del resultado de la consulta
//   } catch (error) {
//     console.error("DB Error:", error); // Captura y log del error
//     throw error;
//   }
// };

const updateRoomStatus = async (id_habitacion, estado) => {
  try {
    // Log inicial con los datos recibidos
    console.log('Iniciando actualización de habitación:', {
      id_habitacion,
      estado,
      tipo_estado: typeof estado
    });

    // Validar que el estado sea 0 o 1
    const estadoNum = parseInt(estado);
    if (estadoNum !== 0 && estadoNum !== 1) {
      throw new Error(`Estado inválido: ${estado}. Debe ser 0 o 1`);
    }

    // Verificar estado actual de la habitación
    const [habitacionActual] = await query(
      'SELECT estado FROM habitaciones WHERE id_habitacion = ?',
      [id_habitacion]
    );

    console.log('Estado actual de la habitación:', habitacionActual);

    if (!habitacionActual) {
      throw new Error(`No se encontró la habitación ${id_habitacion}`);
    }

    // Realizar la actualización
    const result = await query(
      'UPDATE habitaciones SET estado = ? WHERE id_habitacion = ?',
      [estadoNum, id_habitacion]
    );

    console.log('Resultado de la actualización:', result);

    // Verificar el nuevo estado
    const [habitacionActualizada] = await query(
      'SELECT estado FROM habitaciones WHERE id_habitacion = ?',
      [id_habitacion]
    );

    console.log('Estado después de la actualización:', habitacionActualizada);

    if (!result.affectedRows) {
      throw new Error('La actualización no afectó ningún registro');
    }

    return result;

  } catch (error) {
    console.error('Error detallado:', {
      mensaje: error.message,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    throw error;
  }
};

// Función para actualizar el estado de una reserva
// const updateReservationStatus = async (id_reserva, estado) => {
//   try {
//     console.log(`Updating reservation ${id_reserva} to state ${estado}`);
//     await query(`UPDATE reservas SET estado = ? WHERE id_reserva = ?`, [
//       estado,
//       id_reserva,
//     ]);
//   } catch (error) {
//     throw error;
//   }
// };

const updateReservationStatus = async (id_reserva, estado) => {
  try {
    console.log(`Updating reservation ${id_reserva} to state ${estado}`);
    if (!estado) {
      throw new Error("El estado de la reserva no puede ser nulo");
    }
    await query(`UPDATE reservas SET estado = ? WHERE id_reserva = ?`, [
      estado,
      id_reserva,
    ]);
  } catch (error) {
    throw error;
  }
};

// Controlador para renderizar la vista de administración manual de estados
// const administracionManualEstados = async (req, res) => {
//  try {
//    const { rooms, reservations } = await getAllRoomsAndReservations();
//    res.render("administracionManualEstados", { rooms, reservations });
//  } catch (error) {
//    console.error("Error al obtener habitaciones y reservas: ", error);
//    res.status(500).send("Error en el servidor");
//  }
// };

// Controlador para actualizar el estado de una habitación
//const updateRoomState = async (req, res) => {
//  const { id_habitacion, estado } = req.body;
//
//  try {
//    if (!id_habitacion || estado === undefined) {
//      throw new Error('Faltan datos requeridos');
//    }
//
//    await updateRoomStatus(id_habitacion, estado);
//
//    // Verificar el estado actual después de la actualización
//    const [habitacion] = await query(
//      'SELECT estado FROM habitaciones WHERE id_habitacion = ?',
//      [id_habitacion]
//    );
//
//    if (habitacion && habitacion.estado.toString() === estado) {
//      if (req.flash) {
//        req.flash('success', 'Estado de habitación actualizado //correctamente');
//      }
//      res.redirect("/administracionManualEstados");
//    } else {
//      throw new Error('La actualización no se completó correctamente');
//    }
    
//  } catch (error) {
//    console.error("Error al actualizar estado de habitación:", error);
//    if (req.flash) {
//      req.flash('error', error.message);
//    }
//    res.redirect("/administracionManualEstados");
//  }
// };

// Controlador para actualizar el estado de una reserva

const administracionManualEstados = async (req, res) => {
  try {
    const { rooms, reservations } = await getAllRoomsAndReservations();
    res.render("administracionManualEstados", { 
      rooms, 
      reservations,
      success_msg: req.flash('success'),
      error_msg: req.flash('error')
    });
  } catch (error) {
    console.error("Error al obtener habitaciones y reservas: ", error);
    res.status(500).send("Error en el servidor");
  }
};

const updateRoomState = async (req, res) => {
  const { id_habitacion, estado } = req.body;

  try {
    if (!id_habitacion || estado === undefined) {
      throw new Error('Faltan datos requeridos');
    }

    await updateRoomStatus(id_habitacion, estado);
    
    // Obtener datos actualizados
    const { rooms, reservations } = await getAllRoomsAndReservations();
    
    // Renderizar la vista con datos actualizados
    res.render("administracionManualEstados", { 
      rooms, 
      reservations,
      success_msg: ['Estado de habitación actualizado correctamente'],
      error_msg: []
    });
    
  } catch (error) {
    console.error("Error al actualizar estado de habitación:", error);
    const { rooms, reservations } = await getAllRoomsAndReservations();
    res.render("administracionManualEstados", { 
      rooms, 
      reservations,
      success_msg: [],
      error_msg: [error.message]
    });
  }
};

const updateReservationState = async (req, res) => {
  const { id_reserva, estado } = req.body;
  console.log(
    `Received request to update reservation ${id_reserva} to state ${estado}`
  );
  try {
    await updateReservationStatus(id_reserva, estado);
    res.redirect("/administracionManualEstados");
  } catch (error) {
    console.error("Error al actualizar el estado de la reserva: ", error);
    res.status(500).send("Error en el servidor");
  }
};

module.exports = {
  administracionManualEstados,
  updateRoomState,
  updateReservationState,
};
