# Memory

## Contexto de la sesión
- Proyecto: Sistema de Gestión Hotelera — Posadas
- Estado: Todos los lotes completados (1-5) + Opción A + Opción B + Items 2-5
- Git: `280b3ed` — Agrega /scratch a .gitignore
- MySQL: Servicio WAMP MySQL 8.4.7 activo
- Servidor Node: nodemon activo en http://localhost:3000

## Logros
- ✅ Lote 1: Hashes bcrypt reales + regeneración de sesión
- ✅ Lote 2: Limpieza de código (−928 líneas)
- ✅ Lote 3a: Rate limit a variables de entorno
- ✅ Lote 3b: Sanitización, CSRF, CSP, autenticación en rutas
- ✅ Lote 4: Consistencia de BD
- ✅ Lote 5: Transacciones (8 controladores + db.js helper)
- ✅ Opción A: `authenticate` redundante removido de 4 archivos (9 rutas)
- ✅ Reporte de auditoría: `tools/reportes/auditoria-autenticacion.md`
- ✅ Item 2: Bug `:id:url` → `:id` en `consultaClienteCalendario.js`
- ✅ Item 3: Doble mount `checkServerDB.js` eliminado de `router.js`
- ✅ Item 4: Dead deps `winston`, `winston-daily-rotate-file`, `date-fns` eliminadas de `package.json`
- ✅ Item 5: `morgan` movido de devDependencies a dependencies
- ✅ **Opción B**: `authorize(["admin"])` agregado a 13 rutas en 9 archivos
- ✅ Opción B ajuste: `consultaGral` permite admin + data entry
- ✅ `scratch/` agregado a `.gitignore`
- ✅ **Sesión 06/06/2026**: Eliminación de inline event handlers (`onclick`/`onsubmit`) en 4 vistas EJS que violaban CSP → reemplazados por `data-*` + event delegation. Vistas afectadas: `administracionManualEstados.ejs`, `consultaClienteCalendario.ejs`, `historialHabitaciones.ejs`, `mapaHabitacionCalendario.ejs`. Server probado — todos los endpoints 200 OK.

## Reglas a cumplir
- No modificar código sin autorización explícita
- Consultar siempre antes de ejecutar acciones (iniciar/detener servicios, probar, modificar)
- Checkpoint antes de cambios masivos; backup antes de cambios individuales
