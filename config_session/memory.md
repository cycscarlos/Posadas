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
- ✅ **Sesión 06/06/2026**: Eliminación de inline event handlers (`onclick`/`onsubmit`) en 4 vistas EJS que violaban CSP → reemplazados por `data-*` + event delegation.
  - Vistas afectadas: `administracionManualEstados.ejs`, `consultaClienteCalendario.ejs`, `historialHabitaciones.ejs`, `mapaHabitacionCalendario.ejs`.
  - Server probado — todos los endpoints 200 OK (4 vistas + 20 assets estáticos).
  - Checkpoint: `0301603` — "checkpoint: elimina inline event handlers onclicken 4 vistas EJS (CSP)"
  - 3 falsos positivos dentro de HTML comments (no ejecutados): `consultaClienteCalendario.ejs:98`, `enviar-correo.ejs:177`, `editar.ejs:30`.
- ✅ **Sesión 08/06/2026**: Formato y validación de cédula/teléfono en formularios + tabla consultaGral.
  - Cédula: dropdown V-/E- + autoformato con puntos (24.209.695). Almacena: `V-24209695`
  - Teléfono: dropdown +58/+1 + autoformato según país (0414.324.63.96 / 212.345.6789). Almacena: `+5804143246396`
  - Patrones HTML5 corregidos para compatibilidad con flag `v` (acentos, ranges inválidos)
  - `formValidation.js`: bugs corregidos (variables mal asignadas, regexCedula separada)
  - CSP: `use.fontawesome.com` agregado a `styleSrc`
  - Regla #9 agregada a `rules.md` (ciclo post-cambios)
  - Nuevo archivo: `public/js/formatInputs.js`
  - Archivos modificados: `index.js`, `public/css/main.css`, `public/js/formValidation.js`, `src/controllers/ctrl_consultaGral.js`, `src/views/editar.ejs`, `src/views/registro.ejs`, `src/views/registro-modal.ejs`
  - Checkpoint: `c14426c` — "checkpoint: formato y validacion de cedula y telefono (prefijos, puntos, acentos)"
- ✅ **Sesión 08/06/2026 (continuación)**:
  - Bug: formato telefóno (regex greedy `\d+` capturaba todo) → corregido con detección por códigos conocidos +58/+1
  - Bug: middleware `validateAndFormatDatesInRequest` nunca se ejecutaba (field names `fecha_entrada` vs `entrada`) + faltaba validación `salida > entrada` → corregido
  - Bug: `ctrl_actualizar.js` hacía `UPDATE reservas` aunque no existiera fila → ahora hace `INSERT` si no existe
  - Título de consultaGral movido al header (entre logo y Menú)
  - `navbar.html` componentizado: acepta `pageTitle` opcional
  - `userManagement.ejs`: título en header vía navbar
  - Checkpoints: `521b273` (memory.md), `c14426c` (formato cédula/teléfono), `63eef80` (título consultaGral)
  - Pendiente: aplicar patrón título-en-header a otras páginas (coordinar por separado)

## Reglas a cumplir
- No modificar código sin autorización explícita
- Consultar siempre antes de ejecutar acciones
- Checkpoint antes de cambios masivos; backup antes de cambios individuales
