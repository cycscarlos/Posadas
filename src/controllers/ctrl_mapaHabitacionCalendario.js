const { query } = require("../database/db.js");
const formatFields = require("../middlewares/formatFields.js");

// Función para formatear las fechas
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // Formato dd/mm/aaaa
};

// Ruta para consultar al cliente
exports.consultaCliente = async (req, res) => {
  const clienteId = req.params.id;

  try {
    // Obtener los datos del cliente
    const clienteResults = await query(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [clienteId]
    );

    if (clienteResults.length > 0) {
      const cliente = clienteResults[0];

      // Obtener las fechas de entrada y salida de la tabla 'reservas'
      const reservasResults = await query(
        "SELECT fecha_entrada, fecha_salida, id_habitacion FROM reservas WHERE id_cliente = ?",
        [cliente.id_cliente]
      );

      if (reservasResults.length > 0) {
        const reserva = reservasResults[0];
        cliente.fecha_entrada = formatDate(reserva.fecha_entrada);
        cliente.fecha_salida = formatDate(reserva.fecha_salida);
        cliente.id_habitacion = reserva.id_habitacion;
      }

      // Formatear cédula y teléfono usando el middleware
      if (cliente.cedula) {
        cliente.cedula = formatFields.formatCedula(cliente.cedula);
      }
      if (cliente.telefono) {
        cliente.telefono = formatFields.formatTelefono(cliente.telefono);
      }

      // Redirigir a la vista con los datos
      res.render("ficha-cliente", { cliente });
    } else {
      // Cliente no encontrado
      res.render("ficha-cliente", {
        cliente: null,
        clienteNoExiste: true,
      });
    }
  } catch (error) {
    console.error("Error de base de datos:", error);
    return res.status(500).send("Error de base de datos");
  }
};

// Nueva función para manejar la solicitud AJAX y renderizar la vista del formulario de registro
exports.cargarFormularioRegistro = async (req, res) => {
  const { habitacion, mes, dia } = req.query;
  try {
    // Renderizar la vista del formulario de registro
    res.render("registro-modalMapa", { habitacion, mes, dia });
  } catch (error) {
    console.error("Error al cargar el formulario de registro:", error);
    res.status(500).send("Error al cargar el formulario de registro");
  }
};

// Nueva función para consultar cliente en modal
exports.consultaClienteCalendario = async (req, res) => {
  const clienteId = req.params.id;
  try {
    // Obtener los datos del cliente
    const clienteResults = await query(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [clienteId]
    );

    if (clienteResults.length > 0) {
      const cliente = clienteResults[0];

      // Obtener las fechas de entrada y salida de la tabla 'reservas'
      const reservasResults = await query(
        "SELECT fecha_entrada, fecha_salida, id_habitacion FROM reservas WHERE id_cliente = ?",
        [cliente.id_cliente]
      );

      if (reservasResults.length > 0) {
        const reserva = reservasResults[0];
        cliente.fecha_entrada = formatDate(reserva.fecha_entrada);
        cliente.fecha_salida = formatDate(reserva.fecha_salida);
        cliente.id_habitacion = reserva.id_habitacion;
      }

      // Formatear cédula y teléfono usando el middleware
      if (cliente.cedula) {
        cliente.cedula = formatFields.formatCedula(cliente.cedula);
      }
      if (cliente.telefono) {
        cliente.telefono = formatFields.formatTelefono(cliente.telefono);
      }

      res.render("ficha-clienteCalendario", { cliente });
    } else {
      res.render("ficha-clienteCalendario", {
        cliente: null,
        clienteNoExiste: true,
      });
    }
  } catch (error) {
    console.error("Error de base de datos:", error);
    return res.status(500).send("Error de base de datos");
  }
};

exports.consultaFichaModal = async (req, res) => {
  const clienteId = req.params.id;

  try {
    const clienteQuery = `
      SELECT
        c.*,
        r.id_reserva,
        r.fecha_entrada,
        r.fecha_salida,
        r.id_habitacion,
        r.estado as estado_reserva,
        p.monto,
        p.fecha_pago,
        mp.metodo
      FROM clientes c
      LEFT JOIN reservas r ON c.id_cliente = r.id_cliente
      LEFT JOIN pagos p ON (p.id_cliente = c.id_cliente OR p.id_reserva = r.id_reserva)
      LEFT JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
      WHERE c.id_cliente = ?`;

    const clienteData = await query(clienteQuery, [clienteId]);

    if (clienteData && clienteData.length > 0) {
      const cliente = {
        ...clienteData[0],
        fecha_entrada: clienteData[0].fecha_entrada
          ? formatDate(clienteData[0].fecha_entrada)
          : null,
        fecha_salida: clienteData[0].fecha_salida
          ? formatDate(clienteData[0].fecha_salida)
          : null,
        cedula: formatFields.formatCedula(clienteData[0].cedula),
        telefono: formatFields.formatTelefono(clienteData[0].telefono),
      };

      // Obtener pagos sin filtrar por estado de reserva
      const pagosQuery = `
        SELECT
          p.monto,
          p.fecha_pago,
          mp.metodo
        FROM pagos p
        JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
        WHERE p.id_cliente = ?
        ORDER BY p.fecha_pago DESC`;

      const pagos = await query(pagosQuery, [clienteId]);

      cliente.pagos = pagos.map((pago) => ({
        monto: pago.monto,
        fecha_pago: formatDate(pago.fecha_pago),
        metodo: pago.metodo,
      }));

      // Si hay pagos, usar el más reciente como pago actual
      if (pagos.length > 0) {
        const ultimoPago = pagos[0];
        cliente.fecha_pago = formatDate(ultimoPago.fecha_pago);
        cliente.monto = ultimoPago.monto;
        cliente.metodo = ultimoPago.metodo;
      }

      res.render("ficha-modal", {
        cliente,
        clienteNoExiste: false,
      });
    } else {
      res.render("ficha-modal", {
        cliente: null,
        clienteNoExiste: true,
      });
    }
  } catch (error) {
    console.error("Error al cargar la ficha modal:", error);
    return res.status(500).send("Error de base de datos");
  }
};

// Función para ver detalles de una habitación específica
exports.verStatusReservaHabitacion = async (req, res) => {
  try {
    const habitacionId = req.params.id; // Asumiendo que el ID de la habitación se pasa como parámetro en la URL
    const habitaciones = await query(
      "SELECT id_habitacion, tipo_habitacion, estado FROM habitaciones WHERE id_habitacion = ?",
      [habitacionId]
    );

    if (habitaciones.length === 0) {
      return res.status(404).render("error", {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Habitación no encontrada.",
        alertIcon: "error",
        showConfirmButton: true,
        timer: 3000,
      });
    }

    const reservas = await query(
      `SELECT r.id_habitacion, r.fecha_entrada, r.fecha_salida, r.estado, c.id_cliente, c.nombre, c.correo
       FROM reservas r
       JOIN clientes c ON r.id_cliente = c.id_cliente
       WHERE r.id_habitacion = ? AND r.estado IN ('reservada', 'activa', 'pre-reservada')`,
      [habitacionId]
    );

    const pagos = await query(
      `SELECT p.id_reserva, p.monto, p.fecha_pago, mp.metodo
       FROM pagos p
       JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
       WHERE p.id_reserva IN (SELECT id_reserva FROM reservas WHERE id_habitacion = ? AND estado IN ('reservada', 'activa', 'pre-reservada'))`,
      [habitacionId]
    );

    const habitacion = habitaciones[0]; // Obtenemos la habitación específica

    // Crear estructura para la disponibilidad de la habitación
    const disponibilidad = {
      id: habitacion.id_habitacion,
      tipo: habitacion.tipo_habitacion,
      estado: habitacion.estado,
      calendarios: {}, // Guardaremos aquí la disponibilidad por año y mes
    };

    // Obtener el mes y año actual
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1; // Meses en Javascript son 0-indexados
    const añoActual = fechaActual.getFullYear();

    // Definir meses del año actual desde el mes actual hasta diciembre
    for (let mes = mesActual; mes <= 12; mes++) {
      const diasMes = new Date(añoActual, mes, 0).getDate(); // Obtener días en el mes
      disponibilidad.calendarios[`${mes}`] = {
        año: añoActual,
        dias: Array.from({ length: diasMes }, (_, dia) => ({
          dia: dia + 1,
          estado: "disponible", // estados por defecto
          cliente: null, // Inicialmente sin cliente
          pago: null, // Inicialmente sin pago
        })),
      };
    }

    // Agregar los tres primeros meses del próximo año
    for (let mes = 1; mes <= 3; mes++) {
      const diasMes = new Date(añoActual + 1, mes, 0).getDate(); // Obtener días en el mes
      disponibilidad.calendarios[`${mes + 12}`] = {
        // Usamos mes + 12 para diferenciarlos
        año: añoActual + 1,
        dias: Array.from({ length: diasMes }, (_, dia) => ({
          dia: dia + 1,
          estado: "disponible", // estados por defecto
          cliente: null, // Inicialmente sin cliente
          pago: null, // Inicialmente sin pago
        })),
      };
    }

    // Marcar reservas como ocupadas o pre-reservadas solo en los días específicos
    reservas.forEach((reserva) => {
      const fechaInicio = new Date(reserva.fecha_entrada);
      const fechaFin = new Date(reserva.fecha_salida);

      // Bucle para recorrer cada día entre fechaInicio y fechaFin
      for (
        let dia = new Date(fechaInicio);
        dia <= fechaFin;
        dia.setDate(dia.getDate() + 1)
      ) {
        const año = dia.getFullYear();
        const mes = dia.getMonth() + 1; // Los meses en JavaScript son 0-indexed
        const diaDelMes = dia.getDate();

        // Asegurarse de que el calendario para este mes exista
        const mesKey = `${mes}`;
        const nextYearMesKey = `${mes + 12}`; // Para los meses del próximo año

        if (disponibilidad.calendarios[mesKey]) {
          // Marcar el día según el estado de la reserva
          if (disponibilidad.calendarios[mesKey].dias[diaDelMes - 1]) {
            disponibilidad.calendarios[mesKey].dias[diaDelMes - 1].estado =
              reserva.estado === "pre-reservada" ? "pre-reservado" : "ocupado";
            disponibilidad.calendarios[mesKey].dias[diaDelMes - 1].cliente = {
              id: reserva.id_cliente,
              nombre: reserva.nombre,
              correo: reserva.correo,
            };

            // Buscar el pago correspondiente a esta reserva
            const pago = pagos.find((p) => p.id_reserva === reserva.id_reserva);
            if (pago) {
              disponibilidad.calendarios[mesKey].dias[diaDelMes - 1].pago = {
                monto: pago.monto,
                fecha_pago: formatDate(pago.fecha_pago),
                metodo: pago.metodo,
              };
            }
          }
        } else if (disponibilidad.calendarios[nextYearMesKey]) {
          // Si el mes es del próximo año, marcar el día según el estado de la reserva
          if (disponibilidad.calendarios[nextYearMesKey].dias[diaDelMes - 1]) {
            disponibilidad.calendarios[nextYearMesKey].dias[
              diaDelMes - 1
            ].estado =
              reserva.estado === "pre-reservada" ? "pre-reservado" : "ocupado";
            disponibilidad.calendarios[nextYearMesKey].dias[
              diaDelMes - 1
            ].cliente = {
              id: reserva.id_cliente,
              nombre: reserva.nombre,
              correo: reserva.correo,
            };

            // Buscar el pago correspondiente a esta reserva
            const pago = pagos.find((p) => p.id_reserva === reserva.id_reserva);
            if (pago) {
              disponibilidad.calendarios[nextYearMesKey].dias[
                diaDelMes - 1
              ].pago = {
                monto: pago.monto,
                fecha_pago: formatDate(pago.fecha_pago),
                metodo: pago.metodo,
              };
            }
          }
        }
      }
    });

    // Renderizar la vista con disponibilidad de la habitación
    res.render("mapaHabitacionCalendario", { habitacion: disponibilidad });
  } catch (error) {
    console.error("Error al consultar disponibilidad de la habitación:", error);
    res.status(500).render("error", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Error al consultar disponibilidad de la habitación.",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
    });
  }
};
