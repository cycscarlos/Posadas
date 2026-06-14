# Memory

## Contexto de la sesión
- Proyecto: Sistema de Gestión Hotelera — Posadas
- Estado: Todos los lotes completados (1-5) + Opción A + Opción B + Items 2-5
- Git: `5d121e5` — checkpoint: ¡Listo el Chatbot!
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
- ✅ **Sesión 09/06/2026**: UI de userManagement corregida.
  - `.container` margin-top reducido de `14rem` a `5rem` (formulario muy abajo)
  - `#registerForm` centrado con flexbox (formulario no centrado)
  - Título movido del header fijo al cuerpo (`<h1>` dentro de `.container`) — el título fijo estorbaba al hacer scroll en la tabla larga
  - Inputs ensanchados de `60%` a `80%` para mejor balance visual
  - Archivos: `src/views/userManagement.ejs`, `public/css/userManagement.css`
  - Backup: `userManagement.css.20260609-200922.bak`, `userManagement.ejs.20260609-201159.bak`
  - Bug corregido: `if (btn)` sin llave de cierre en el handler de editar (`edit` click handler, línea 248 → `}` añadido). Causaba `Uncaught users:316 SyntaxError: Unexpected token ')'` en consola DevTools.
  - Archivos: `src/views/userManagement.ejs`
- ✅ **Sesión 09/06/2026 (continuación tarde)**:
  - CSP: `connect-src` agregado `https://cdn.jsdelivr.net` (source map de Chart.js) — `index.js`
  - `historialHabitaciones`: agregado `ORDER BY id_habitacion` a query + fix room #10 `estado='0'` → `'disponible'`
  - Bug `preReservaciones.ejs`/`registro.ejs`: selector `.contactForm form` corregido a `form` (form era padre, no hijo)
  - `disponibilidadPorFecha`: botón "Consultar en Grilla" → "Consultar en Gráfica" + fix overflow con `flex:1; white-space:nowrap`
  - `whatsapp-envioMensajes.ejs`: UI reestructurada para ser idéntica a `enviar-correo.ejs` (mismo CSS, misma estructura, sin wrappers extras). Lógica intacta.
  - `enviar-correo.ejs`: spinner SweetAlert (`Enviando correos...`) + SweetAlert éxito/error (reemplaza `alert()`)
  - `ctrl_envioEmails.js`: plantilla HTML profesional con imágenes de playa (`playa7.webp`, `posadaLogo.webp`), paleta azul/dorado, saludo personalizado, bloque de mensaje destacado, botón "Ver Ofertas", footer con contacto
  - Nuevo archivo: `.docs/habilitar-whatsapp-api.md` — guía paso a paso para habilitar WhatsApp API
  - Backups: `enviar-correo.ejs.20260609-213906.bak`, `ctrl_envioEmails.js.20260609-213906.bak`
  - Pendiente mañana: ajustar detalles de plantilla de correo y spinner
  - Checkpoint final: pendiente

- ✅ **Sesión 11/06/2026**: Múltiples mejoras:
  - UI consultaGral: `white-space: nowrap` en cédula/teléfono + `width: 50px/60px` en personas/habitación
  - Fix PDF: `orientation: landscape` + `pageSize: LEGAL` (muestra todas las columnas)
  - Fix Print: `@page { size: landscape; }` + `font-size: 9px` + `white-space: nowrap`
  - Plantilla email (`ctrl_envioEmails.js`): removido botón "Ver Ofertas", logo bajo header, logoCid, attachment logo; footer: email hardcodeado `posadacasamanantial@gmail.com`, eliminado párrafo "Cancelar suscripción", color `#0077b6`, agregado enlace web
  - Nuevo archivo: `docs/plan-chatbot.md` — plan detallado para chatbot rule-based + BD
  - Git: `33aa207` — checkpoint final
  - ✅ **Sesión 13/06/2026**: Chatbot rule-based implementado.
  - Archivos nuevos (5 + 1 SQL):
    1. `tools/db/chatbot-migracion.sql` — columna `precio` en habitaciones + tabla `promociones`
    2. `src/controllers/ctrl_chatbot.js` — motor rule-based con 13 intenciones (saludo, horarios, dirección, teléfono, email, web, servicios, habitaciones, precio, disponibilidad, promociones, gracias, ayuda)
    3. `src/routes/chatbot.js` — ruta POST /chatbot/message (pública, sin autenticación)
    4. `public/css/chatbot.css` — widget flotante responsive (burbuja 60×60, panel 350×500)
    5. `public/js/chatbot.js` — UI del chat (crea DOM dinámicamente, fetch con CSRF automático)
  - Archivos modificados (2):
    1. `src/router.js` — montado chatbot antes de `authenticate` (ruta pública)
    2. `index.js` — middleware inyecta chatbot.js en todas las páginas automáticamente (sin modificar EJS)
  - CSP: sin cambios necesarios (todo same-origin + `'unsafe-inline'` ya presente)
  - Git: `8f0c30e` — checkpoint final
- ✅ **Sesión 13/06/2026 (continuación)**: Página admin del chatbot.
  - Archivos nuevos (4):
    1. `src/controllers/ctrl_adminChatbot.js` — CRUD precios habitaciones + promociones
    2. `src/routes/adminChatbot.js` — rutas con `authorize(["admin"])`
    3. `src/views/adminChatbot.ejs` — vista estilo userManagement
    4. `public/css/adminChatbot.css` — estilos consistentes
  - Archivos modificados (2):
    1. `src/router.js` — montado `adminChatbot` en rutas protegidas
    2. `src/views/menu.ejs` — enlace en sidebar > Administración
  - Bug fix: `req.csrfToken()` → `req.session.csrfToken` en controller
  - Bug fix: query promociones eliminaba `fecha_inicio <= CURDATE()` (no mostraba promos futuras)
- ✅ **Sesión 13/06/2026 (continuación tarde/noche)**: Mejoras finales Chatbot.
  - Botón "🔙 Menú principal" + "¿Necesitas algo más?" solo aparece al final del flujo de disponibilidad (no en pasos intermedios `tipo`/`fecha`)
  - Eliminado "o escribinos para más información" del mensaje final de disponibilidad
  - Bugfix: quitado `AND h.estado = 'disponible'` de queries de disponibilidad (no mostraba habitaciones con estado 'ocupada' pero sin reservas solapadas)
  - Agregado `\n\n` antes de "Podés contactarnos..." en mensajes de "no disponibles" (ambos handlers)
  - Selección de tipo de habitación por número (1→Matrimonial, 2→Semi Suite, 3→Suite Junior, 4→Suite, 5→Suite VIP) en lugar de texto libre
  - Chatbot inyectado solo en `home.ejs`, `menu.ejs`, `adminChatbot.ejs` (removido middleware global de `index.js`)
  - Menú conversacional con botones clickeables (5 opciones + "🔙 Menú principal")
  - Formato respuestas: bullet points sin tablas, precios en `$`
  - Flujo multi-step disponibilidad: tipo (número) → fecha → días → consulta BD con overlap check
  - Git: `5d121e5` — checkpoint: ¡Listo el Chatbot! (pusheado a origin/main)
- ✅ **Sesión 13/06/2026 — Railway config**:
  - Dependencia: `express-mysql-session` instalada
  - `src/config.js`: soporte para `DATABASE_URL`, `MYSQL_*`, detección automática de Railway (`RAILWAY_SERVICE_ID`)
  - `index.js`: `trust proxy: 1` + MySQL session store en producción/Railway (tabla `sessions_railway`)
  - `railway.json`: configuración Nixpacks + startCommand
  - Backups: `config.js.20260613-164502.bak`, `index.js.20260613-164502.bak`, `package.json.20260613-164502.bak`

## Reglas a cumplir
- No modificar código sin autorización explícita
- Consultar siempre antes de ejecutar acciones
- Checkpoint antes de cambios masivos; backup antes de cambios individuales
