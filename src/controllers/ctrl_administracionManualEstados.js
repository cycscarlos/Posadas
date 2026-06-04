const { query } = require("../database/db.js");

// FunciÃ³n para obtener todas las habitaciones y reservas
const getAllRoomsAndReservations = async () => {
  const rooms = await query(`SELECT * FROM habitaciones`);
  const reservations = await query(`SELECT * FROM reservas`);
  return { rooms, reservations };
};

const updateRoomStatus = async (id_habitacion, estado) => {
  try {
    // Log inicial con los datos recibidos
    console.log('Iniciando actualizaciÃ³n de habitaciÃ³n:', {
      id_habitacion,
      estado,
      tipo_estado: typeof estado
    });

    // Validar que el estado sea uno de los valores permitidos
    const estadosValidos = ['disponible', 'ocupada', 'mantenimiento'];
    if (!estadosValidos.includes(estado)) {
      throw new Error(`Estado invÃ¡lido: ${estado}. Debe ser: disponible, ocupada o mantenimiento`);
    }

    // Verificar estado actual de la habitaciÃ³n
    const [habitacionActual] = await query(
      'SELECT estado FROM habitaciones WHERE id_habitacion = ?',
      [id_habitacion]
    );

    console.log('Estado actual de la habitaciÃ³n:', habitacionActual);

    if (!habitacionActual) {
      throw new Error(`No se encontrÃ³ la habitaciÃ³n ${id_habitacion}`);
    }

    // Realizar la actualizaciÃ³n
    const result = await query(
      'UPDATE habitaciones SET estado = ? WHERE id_habitacion = ?',
      [estado, id_habitacion]
    );

    console.log('Resultado de la actualizaciÃ³n:', result);

    // Verificar el nuevo estado
    const [habitacionActualizada] = await query(
      'SELECT estado FROM habitaciones WHERE id_habitacion = ?',
      [id_habitacion]
    );

    console.log('Estado despuÃ©s de la actualizaciÃ³n:', habitacionActualizada);

    if (!result.affectedRows) {
      throw new Error('La actualizaciÃ³n no afectÃ³ ningÃºn registro');
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
      success_msg: ['Estado de habitaciÃ³n actualizado correctamente'],
      error_msg: []
    });
    
  } catch (error) {
    console.error("Error al actualizar estado de habitaciÃ³n:", error);
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