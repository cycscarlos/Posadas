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

// Función para ver la disponibilidad de habitaciones en un calendario
exports.verCalendarioDisponibilidad = async (req, res) => {
  try {
    // Obtener el estado de las habitaciones
    const habitaciones = await query(
      "SELECT id_habitacion, estado FROM habitaciones ORDER BY id_habitacion"
    );

    // Obtener todas las reservas existentes de la tabla reservas
    const reservas = await query(
      `SELECT r.id_habitacion, r.fecha_entrada, r.fecha_salida, r.estado, c.id_cliente, c.nombre, c.correo
             FROM reservas r
             JOIN clientes c ON r.id_cliente = c.id_cliente
             WHERE r.estado IN ('reservada', 'activa', 'pre-reservada')`
    );

    const pagos = await query(
      `SELECT p.id_reserva, p.monto, p.fecha_pago, mp.metodo
       FROM pagos p
       JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
       WHERE p.id_reserva IN (SELECT id_reserva FROM reservas WHERE estado IN ('reservada', 'activa', 'pre-reservada'))`
    );

    // Crear estructura para disponibilidad
    const disponibilidad = habitaciones.map((habitacion) => ({
      id: habitacion.id_habitacion,
      estado: habitacion.estado,
      calendarios: {}, // Guardaremos aquí la disponibilidad por año y mes
    }));

    // Definir meses del año
    const mesesDelAño = Array.from({ length: 12 }, (_, i) => i + 1);
    const añoActual = new Date().getFullYear();

    // Inicializar calendarios para cada habitación
    disponibilidad.forEach((habitacion) => {
      mesesDelAño.forEach((mes) => {
        const diasMes = new Date(añoActual, mes, 0).getDate(); // Obtener días en el mes
        habitacion.calendarios[`${mes}`] = {
          año: añoActual,
          dias: Array.from({ length: diasMes }, (_, dia) => ({
            dia: dia + 1,
            estado: "", // Sin color por defecto
            cliente: null, // Inicialmente sin cliente
            pago: null, // Inicialmente sin pago
          })),
        };
      });
    });

    // Marcar reservas como ocupadas y pre-reservadas solo en los días específicos
    reservas.forEach((reserva) => {
      const habitacion = disponibilidad.find(
        (h) => h.id === reserva.id_habitacion
      );
      if (habitacion) {
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
          if (habitacion.calendarios[`${mes}`]) {
            // Marcar el día según el estado de la reserva
            if (reserva.estado === "pre-reservada") {
              habitacion.calendarios[`${mes}`].dias[diaDelMes - 1].estado =
                "pre-reservado";
            } else {
              habitacion.calendarios[`${mes}`].dias[diaDelMes - 1].estado =
                "ocupado";
            }
            habitacion.calendarios[`${mes}`].dias[diaDelMes - 1].cliente = {
              id: reserva.id_cliente,
              nombre: reserva.nombre,
              correo: reserva.correo,
            };

            // Buscar el pago correspondiente a esta reserva
            const pago = pagos.find((p) => p.id_reserva === reserva.id_reserva);
            if (pago) {
              habitacion.calendarios[`${mes}`].dias[diaDelMes - 1].pago = {
                monto: pago.monto,
                fecha_pago: formatDate(pago.fecha_pago),
                metodo: pago.metodo,
              };
            }
          }
        }
      }
    });

    // Renderizar la vista con disponibilidad
    res.render("historialHabitaciones", { disponibilidad });
  } catch (error) {
    console.error("Error al consultar disponibilidad:", error);
    res.status(500).render("error", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Error al consultar disponibilidad.",
      alertIcon: "error",
      showConfirmButton: true,
      timer: 3000,
    });
  }
};

// Función para consultar al cliente desde el calendario
exports.consultaClienteCalendario = async (req, res) => {
  const clienteId = req.params.id;

  try {
    // Consulta principal que une todas las tablas necesarias
    const query = `
      SELECT 
        c.*,
        r.fecha_entrada,
        r.fecha_salida,
        r.id_habitacion,
        r.id_reserva,
        p.monto,
        p.fecha_pago,
        mp.metodo
      FROM clientes c
      LEFT JOIN reservas r ON c.id_cliente = r.id_cliente
      LEFT JOIN pagos p ON r.id_reserva = p.id_reserva
      LEFT JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
      WHERE c.id_cliente = ?
      AND r.estado IN ('activa', 'pre-reservada')
      ORDER BY r.fecha_entrada DESC
      LIMIT 1`;

    const clienteResults = await query(query, [clienteId]);

    if (clienteResults.length > 0) {
      const cliente = clienteResults[0];

      // Formatear fechas y otros campos
      if (cliente.fecha_entrada) cliente.fecha_entrada = formatDate(cliente.fecha_entrada);
      if (cliente.fecha_salida) cliente.fecha_salida = formatDate(cliente.fecha_salida);
      if (cliente.fecha_pago) cliente.fecha_pago = formatDate(cliente.fecha_pago);
      
      if (cliente.cedula) cliente.cedula = formatFields.formatCedula(cliente.cedula);
      if (cliente.telefono) cliente.telefono = formatFields.formatTelefono(cliente.telefono);

      // Obtener historial de pagos
      const pagosQuery = `
        SELECT 
          p.monto,
          p.fecha_pago,
          mp.metodo
        FROM pagos p
        JOIN metodos_pago mp ON p.id_metodo_pago = mp.id_metodo_pago
        WHERE p.id_cliente = ?
        ORDER BY p.fecha_pago DESC`;

      const pagosResults = await query(pagosQuery, [clienteId]);
      
      cliente.pagos = pagosResults.map(pago => ({
        monto: pago.monto,
        fecha_pago: formatDate(pago.fecha_pago),
        metodo: pago.metodo
      }));

      res.render("ficha-clienteCalendario", { 
        cliente, 
        clienteNoExiste: false,
        formatDate 
      });
    } else {
      res.render("ficha-clienteCalendario", {
        cliente: null,
        clienteNoExiste: true
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
        fecha_entrada: clienteData[0].fecha_entrada ? formatDate(clienteData[0].fecha_entrada) : null,
        fecha_salida: clienteData[0].fecha_salida ? formatDate(clienteData[0].fecha_salida) : null,
        cedula: formatFields.formatCedula(clienteData[0].cedula),
        telefono: formatFields.formatTelefono(clienteData[0].telefono)
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

      cliente.pagos = pagos.map(pago => ({
        monto: pago.monto,
        fecha_pago: formatDate(pago.fecha_pago),
        metodo: pago.metodo
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
        clienteNoExiste: false
      });
    } else {
      res.render("ficha-modal", {
        cliente: null,
        clienteNoExiste: true
      });
    }
  } catch (error) {
    console.error("Error al cargar la ficha modal:", error);
    return res.status(500).send("Error de base de datos");
  }
};

// Nueva función para manejar la solicitud AJAX y renderizar la vista del formulario de registro
exports.cargarFormularioRegistro = async (req, res) => {
  const { habitacion, mes, dia } = req.query;
  try {
    // Renderizar la vista del formulario de registro
    res.render("registro-modal", { habitacion, mes, dia });
  } catch (error) {
    console.error("Error al cargar el formulario de registro:", error);
    res.status(500).send("Error al cargar el formulario de registro");
  }
};
