/**
 * Script de prueba mejorado para el middleware de automatización de estados
 * Este script permite probar las diferentes funciones de actualización de estado
 * y crea datos de prueba con fechas relativas a la fecha simulada.
 */

// Cargar variables de entorno
require("dotenv").config({ path: "../../env/.env" });

// Establecer NODE_ENV en 'development' para usar valores por defecto en config.js
process.env.NODE_ENV = "development";

// Importar el middleware y las funciones necesarias
const {
  updateReservationStates,
  getLatestReservation,
  checkRoomAvailability,
  updateReservationAndRoomStatus,
  updateRoomStatus,
} = require("../../src/middlewares/automatizacionEstados");

// Importar conexión a la base de datos para pruebas adicionales
const { query, transaction } = require("../../src/database/db");

// Función para limpiar datos de prueba
const limpiarDatosDePrueba = async () => {
  console.log("\n🧹 Limpiando datos de prueba anteriores...");
  try {
    // Eliminar reservas de prueba
    await query(`DELETE FROM reservas WHERE id_cliente = 999`);

    // Restaurar habitaciones a estado disponible
    await query(
      `UPDATE habitaciones SET estado = 1 WHERE id_habitacion IN (101, 102, 103, 104, 105)`
    );

    console.log("✅ Datos de prueba eliminados correctamente");
  } catch (error) {
    console.error("❌ Error al limpiar datos de prueba:", error);
  }
};

// Función para crear habitaciones de prueba si no existen
const crearHabitacionesDePrueba = async () => {
  console.log("\n🏨 Verificando habitaciones de prueba...");
  try {
    // Verificar si existen las habitaciones de prueba
    const habitaciones = await query(
      `SELECT * FROM habitaciones WHERE id_habitacion IN (101, 102, 103, 104, 105)`
    );

    if (habitaciones.length < 5) {
      console.log("Creando habitaciones de prueba...");

      // Crear habitaciones de prueba para no afectar datos existentes
      const habitacionesFaltantes = 5 - habitaciones.length;
      const ultimoIndice =
        habitaciones.length > 0
          ? Math.max(...habitaciones.map((h) => h.id_habitacion))
          : 100;

      for (let i = 0; i < habitacionesFaltantes; i++) {
        const id = ultimoIndice + i + 1;
        await query(
          `
          INSERT INTO habitaciones (id_habitacion, tipo_habitacion, capacidad, precio, estado) 
          VALUES (?, ?, 2, 100.00, 1)
        `,
          [id, `Estándar ${id}`]
        );
      }

      console.log(
        `✅ Se crearon ${habitacionesFaltantes} habitaciones de prueba`
      );
    } else {
      console.log("✅ Habitaciones de prueba ya existen");
    }

    return await query(
      `SELECT * FROM habitaciones WHERE id_habitacion IN (101, 102, 103, 104, 105)`
    );
  } catch (error) {
    console.error("❌ Error al crear habitaciones de prueba:", error);
    return [];
  }
};

// Función para crear reservas de prueba con fechas relativas a la fecha simulada
const crearReservasDePrueba = async (fechaBase) => {
  try {
    console.log(
      `\n📅 Creando reservas de prueba con fecha base: ${
        fechaBase.toISOString().split("T")[0]
      }`
    );

    // Obtener habitaciones de prueba
    const habitaciones = await crearHabitacionesDePrueba();
    if (habitaciones.length === 0) {
      throw new Error("No se pudieron obtener habitaciones de prueba");
    }

    // Limpiar reservas anteriores
    await limpiarDatosDePrueba();

    // Fecha base para las reservas
    const hoy = new Date(fechaBase);
    const ayer = new Date(fechaBase);
    ayer.setDate(ayer.getDate() - 1);
    const manana = new Date(fechaBase);
    manana.setDate(manana.getDate() + 1);
    const dosDiasAtras = new Date(fechaBase);
    dosDiasAtras.setDate(dosDiasAtras.getDate() - 2);
    const dosDiasDespues = new Date(fechaBase);
    dosDiasDespues.setDate(dosDiasDespues.getDate() + 2);

    const formatoFecha = (fecha) => fecha.toISOString().split("T")[0];

    // Crear diferentes tipos de reservas para probar todos los escenarios
    const reservas = [
      // Reserva pre-reservada (comienza mañana)
      {
        id_habitacion: habitaciones[0].id_habitacion,
        fecha_entrada: formatoFecha(manana),
        fecha_salida: formatoFecha(dosDiasDespues),
        estado: "pre-reservada",
        descripcion: "Pre-reservada (comienza mañana)",
      },
      // Reserva reservada (comienza mañana)
      {
        id_habitacion: habitaciones[1].id_habitacion,
        fecha_entrada: formatoFecha(manana),
        fecha_salida: formatoFecha(dosDiasDespues),
        estado: "reservada",
        descripcion: "Reservada (comienza mañana)",
      },
      // Reserva activa (comenzó ayer, termina hoy)
      {
        id_habitacion: habitaciones[2].id_habitacion,
        fecha_entrada: formatoFecha(ayer),
        fecha_salida: formatoFecha(hoy),
        estado: "activa",
        descripcion: "Activa (termina hoy)",
      },
      // Reserva activa (comenzó hace dos días, termina mañana)
      {
        id_habitacion: habitaciones[3].id_habitacion,
        fecha_entrada: formatoFecha(dosDiasAtras),
        fecha_salida: formatoFecha(manana),
        estado: "activa",
        descripcion: "Activa (termina mañana)",
      },
      // Reserva en mantenimiento (terminó ayer)
      {
        id_habitacion: habitaciones[4].id_habitacion,
        fecha_entrada: formatoFecha(dosDiasAtras),
        fecha_salida: formatoFecha(ayer),
        estado: "mantenimiento",
        descripcion: "En mantenimiento (terminó ayer)",
      },
    ];

    // Comprobar qué columnas existen en la tabla reservas
    const columnas = await query(`SHOW COLUMNS FROM reservas`);
    const columnaExiste = (nombre) => columnas.some((c) => c.Field === nombre);

    const tieneColumnaNombreCliente = columnaExiste("nombre_cliente");
    const tieneColumnaDocumento = columnaExiste("documento");
    const tieneColumnaTelefono = columnaExiste("telefono");

    // Insertar reservas
    for (const reserva of reservas) {
      // Construir dinámicamente los campos y valores según las columnas existentes
      let campos =
        "id_cliente, id_habitacion, fecha_entrada, fecha_salida, estado";
      let valoresPlaceholders = "?, ?, ?, ?, ?";
      let valores = [
        999,
        reserva.id_habitacion,
        reserva.fecha_entrada,
        reserva.fecha_salida,
        reserva.estado,
      ];

      // Agregar columnas opcionales si existen
      if (tieneColumnaNombreCliente) {
        campos += ", nombre_cliente";
        valoresPlaceholders += ", ?";
        valores.push(reserva.descripcion);
      }

      if (tieneColumnaDocumento) {
        campos += ", documento";
        valoresPlaceholders += ", ?";
        valores.push("12345678");
      }

      if (tieneColumnaTelefono) {
        campos += ", telefono";
        valoresPlaceholders += ", ?";
        valores.push("555-1234");
      }

      await query(
        `
        INSERT INTO reservas (${campos})
        VALUES (${valoresPlaceholders})
      `,
        valores
      );

      // Actualizar estado de la habitación si la reserva está activa o en mantenimiento
      if (reserva.estado === "activa" || reserva.estado === "mantenimiento") {
        await updateRoomStatus(reserva.id_habitacion, 0);
      }
    }

    console.log(`✅ Se crearon ${reservas.length} reservas de prueba`);
    return true;
  } catch (error) {
    console.error("❌ Error al crear reservas de prueba:", error);
    return false;
  }
};

// Función para cambiar el tiempo simulado sin modificar la base de datos
const simulateDateChange = async (fecha, hora) => {
  // Crear fecha de simulación
  const [year, month, day] = fecha.split("-").map(Number);
  const testDate = new Date(year, month - 1, day, hora, 0, 0);

  console.log(
    `\n🕑 Simulando fecha: ${testDate.toLocaleDateString()} ${testDate.toLocaleTimeString()}`
  );

  // Guardar la implementación original de Date
  const OriginalDate = Date;
  const originalNow = Date.now;
  const originalToString = Date.prototype.toString;
  const originalGetTime = Date.prototype.getTime;

  try {
    // Modificar Date para simular una fecha específica
    global.Date = class extends OriginalDate {
      constructor(...args) {
        if (args.length === 0) {
          super(testDate);
        } else {
          super(...args);
        }
      }

      static now() {
        return testDate.getTime();
      }
    };

    // Mantener otros comportamientos de Date
    Date.prototype.toString = originalToString;
    Date.prototype.getTime = originalGetTime;

    // Ejecutar la actualización de estados
    console.log("Ejecutando actualización de estados con fecha simulada...");
    await updateReservationStates();
    console.log("✅ Actualización de estados completada correctamente");

    // Mostrar resultados
    await mostrarEstadoReservasPrueba();
    await mostrarEstadoHabitacionesPrueba();
  } catch (error) {
    console.error("❌ Error durante la simulación:", error);
  } finally {
    // Restaurar la implementación original de Date
    global.Date = OriginalDate;
    Date.now = originalNow;
  }
};

// Función para mostrar solo las reservas de prueba
const mostrarEstadoReservasPrueba = async () => {
  try {
    // Detectar si la columna nombre_cliente existe
    const columnas = await query(`SHOW COLUMNS FROM reservas`);
    const tieneColumnaNombreCliente = columnas.some(
      (c) => c.Field === "nombre_cliente"
    );

    // Construir la consulta basada en las columnas disponibles
    let selectFields =
      "r.id_reserva, r.id_habitacion, h.tipo_habitacion, r.fecha_entrada, r.fecha_salida, r.estado";

    if (tieneColumnaNombreCliente) {
      selectFields += ", r.nombre_cliente";
    }

    const reservas = await query(`
      SELECT ${selectFields}
      FROM reservas r
      JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
      WHERE r.id_cliente = 999
      ORDER BY r.id_habitacion
    `);

    console.log("\n📋 ESTADO ACTUAL DE RESERVAS DE PRUEBA:");
    console.table(reservas);
  } catch (error) {
    console.error("Error al obtener reservas de prueba:", error);
  }
};

// Función para mostrar solo las habitaciones de prueba
const mostrarEstadoHabitacionesPrueba = async () => {
  try {
    const habitaciones = await query(`
      SELECT id_habitacion, tipo_habitacion, 
             CASE WHEN estado = 1 THEN 'Disponible' ELSE 'Ocupada' END AS estado 
      FROM habitaciones
      WHERE id_habitacion IN (101, 102, 103, 104, 105)
      ORDER BY id_habitacion
    `);

    console.log("\n🏨 ESTADO ACTUAL DE HABITACIONES DE PRUEBA:");
    console.table(habitaciones);
  } catch (error) {
    console.error("Error al obtener habitaciones de prueba:", error);
  }
};

// Función principal de pruebas
const ejecutarPruebas = async () => {
  try {
    console.log(
      "🧪 INICIANDO PRUEBAS MEJORADAS DEL MIDDLEWARE DE AUTOMATIZACIÓN DE ESTADOS 🧪"
    );

    // Fecha base para las pruebas (hoy)
    const fechaBase = new Date();
    fechaBase.setHours(0, 0, 0, 0); // Establecer a las 00:00:00

    // Crear datos de prueba
    const datosCreados = await crearReservasDePrueba(fechaBase);
    if (!datosCreados) {
      throw new Error("No se pudieron crear los datos de prueba");
    }

    // Mostrar estado inicial
    console.log("\n📊 ESTADO INICIAL:");
    await mostrarEstadoReservasPrueba();
    await mostrarEstadoHabitacionesPrueba();

    // Obtener fecha base en formato YYYY-MM-DD
    const fechaISO = fechaBase.toISOString().split("T")[0];

    // ESCENARIO 1: Por la mañana (10:00 AM)
    // Esperamos que las reservas activas sigan activas, las pre-reservadas y reservadas para mañana no cambien
    await simulateDateChange(fechaISO, 10);

    // ESCENARIO 2: A la 1:00 PM (hora de limpieza)
    // Esperamos que las reservas activas que terminan hoy cambien a "en limpieza"
    await simulateDateChange(fechaISO, 13);

    // ESCENARIO 3: A las 3:00 PM (finalización de limpieza)
    // Esperamos que las reservas "en limpieza" cambien a "disponible"
    await simulateDateChange(fechaISO, 15);

    // ESCENARIO 4: Al día siguiente por la mañana
    // Esperamos que las reservas pre-reservadas y reservadas para este día cambien a "activas"
    const manana = new Date(fechaBase);
    manana.setDate(manana.getDate() + 1);
    const mananaISO = manana.toISOString().split("T")[0];
    await simulateDateChange(mananaISO, 10);

    console.log("\n🏁 PRUEBAS COMPLETADAS");

    // Limpiar datos de prueba al finalizar
    await limpiarDatosDePrueba();
  } catch (error) {
    console.error("Error general durante las pruebas:", error);
  } finally {
    // Cerrar conexiones de BD después de las pruebas
    process.exit(0);
  }
};

// Ejecutar pruebas
ejecutarPruebas();
