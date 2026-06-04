# Auditoría de Autenticación y Autorización — Posadas

> Generado: 2026-06-04 tras finalizar Lote 5
> Propósito: Reporte analítico para decidir Opción B (roles en rutas sensibles)

---

## 1. Arquitectura Actual

### 1.1 Middleware pipeline (index.js)
```
Helmet → Session → CSRF (generateToken) → Rate Limiter → Auth (router.use) → Controller
```

### 1.2 Router público vs protegido (router.js)
```
Rutas públicas (antes de authenticate):
  GET/POST  /login
  GET       /logout
  GET/POST  /forgot-password
  GET       /reset-password/:token
  POST      /reset-password

router.use(authenticate)  ← todo lo demás requiere sesión

Rutas protegidas (23 archivos):
  administracionManualEstados, actualizar, historialHabitaciones,
  consultaGral, consultaCliente, consultaClienteCalendario,
  consultaPagos, disponibilidadPorFecha, depuracion, editar,
  eliminar, envioEmails, graficas, menu, mapaHabitaciones,
  mapaHabitacionCalendario, pagos, preReservaciones, registro,
  statusReservaciones, checkServerDB (muerto aquí), userManagement,
  whatsappEnvioMsgs
```

### 1.3 Middleware `authenticate.js`
- Verifica `req.session.userId` existente
- Consulta `SELECT * FROM login WHERE id = ?`
- Si no existe → renderiza login con error "No autenticado"
- Si existe → `req.user = user` + `next()`

### 1.4 Middleware `authorize.js`
- Toma `roles` como parámetro (ejs. `["admin"]`)
- Verifica `req.user.rol` contra la lista
- Si no coincide → 403

---

## 2. Rutas sin control de roles (solo authenticate)

Cualquier usuario autenticado (admin o data entry) puede acceder a:

| Ruta | Método | Acción | Riesgo |
|------|--------|--------|--------|
| `/registro` | POST | Crear cliente + reserva + pago | **Alto** — escribe en 4 tablas |
| `/registro-modal` | POST | Crear desde modal | **Alto** — escribe en 4 tablas |
| `/actualizar/:id` | POST | Modificar cliente + reserva + habitación | **Alto** — modifica 3 tablas |
| `/editar/:id` | GET | Ver formulario de edición | Medio — expone datos del cliente |
| `/pagos/:id/agregar-pago` | POST | Crear pagos | **Alto** — escribe en 2 tablas |
| `/pagos` | GET | Ver todos los pagos | Medio — expone datos financieros |
| `/consultaGral` | GET | Ver TODOS los clientes | Medio — expone BD completa |
| `/consulta-cliente` | GET/POST | Buscar clientes | Bajo — solo lectura |
| `/disponibilidadPorFecha` | POST | Consultar disponibilidad | Bajo — solo lectura |
| `/enviar-correo` | GET/POST | Enviar emails | **Alto** — puede enviar desde el sistema |
| `/whatsapp-envioMensajes` | GET/POST | Enviar WhatsApp | **Alto** — puede enviar desde el sistema |
| `/historialHabitaciones` | GET | Ver historial | Bajo — solo lectura |
| `/mapaHabitaciones` | GET | Ver mapa | Bajo — solo lectura |
| `/mapaHabitacionCalendario/:id` | GET | Ver calendario | Bajo — solo lectura |
| `/graficas` | GET | Ver gráficas | Bajo — solo lectura |
| `/preReservaciones` | GET/POST/PUT/DELETE | CRUD pre-reservas | **Alto** — escribe en 3 tablas |
| `/statusReservaciones` | GET | Ver status | Bajo — solo lectura |
| `/menu` | GET | Ver menú | Bajo — solo lectura |

---

## 3. Rutas CON control de roles (solo admin)

| Ruta | Método | Middleware | Acción |
|------|--------|-----------|--------|
| `/eliminar/:id` | GET | `authorize(["admin"])` | Eliminar clientes |
| `/depuracion` | GET/POST | `authorize(["admin"])` | Depuración de BD |
| `/updateRoomState` | POST | `authorize(["admin"])` | Cambiar estado manual |
| `/updateReservationState` | POST | `authorize(["admin"])` | Cambiar estado reserva |
| `/register` | POST | `authorize(["admin"])` | Crear usuarios del sistema |
| `/update/:id` | POST | `authorize(["admin"])` | Modificar usuarios |
| `/delete/:id` | POST | `authorize(["admin"])` | Eliminar usuarios |
| `/users` | GET | `authorize(["admin"])` | Ver lista de usuarios |

---

## 4. Redundancias eliminadas (Opción A)

Se removió `authenticate` redundante de 4 archivos (9 rutas) porque el global `router.use(authenticate)` ya las protege:

| Archivo | Rutas afectadas |
|---------|----------------|
| `routes/administracionManualEstados.js` | 2 POST |
| `routes/depuracion.js` | GET, POST |
| `routes/eliminar.js` | GET |
| `routes/userManagement.js` | POST x3, GET |

---

## 5. Recomendaciones para Opción B

### 5.1 Alto riesgo (requieren admin)
- `POST /registro` — escribe clientes, reservas, pagos, metodos_pago
- `POST /registro-modal` — ídem
- `POST /actualizar/:id` — modifica 3 tablas
- `POST /pagos/:id/agregar-pago` — crea pagos
- `POST /preReservaciones` — crea pre-reservas con pagos
- `PUT/DELETE /preReservaciones/:id` — modifica/elimina
- `GET /eliminar/:id` — **ya requiere admin** ✅
- `POST /enviar-correo` — enviar como el sistema
- `POST /whatsapp-envioMensajes` — enviar como el sistema

### 5.2 Riesgo medio (solo lectura de datos sensibles)
- `GET /consultaGral` — expone toda la BD
- `GET /pagos` — datos financieros
- `GET /editar/:id` — datos de clientes

### 5.3 Riesgo bajo (lectura general)
- `GET /historialHabitaciones`, `/mapaHabitaciones`, `/graficas`, `/menu`
- `GET /consulta-cliente` (ya tiene búsqueda)
- `GET /disponibilidadPorFecha`

### 5.4 Posible modelo de roles
```
admin      → todo (CRUD completo + gestión usuarios + depuración)
data entry → operaciones diarias (registro, pagos, consultas, whatsapp, email)
recepcion  → consulta + registro básico (futuro)
```

---

## 6. Otros hallazgos

| # | Hallazgo | Estado |
|---|----------|--------|
| 1 | `consultaClienteCalendario.js` ruta `:id:url` — parámetros adjuntos sin separador | ❌ Bug (nunca funcionó) |
| 2 | `checkServerDB.js` montado doble (index.js + router.js) | 🟡 Muerto en router, no afecta |
| 3 | `reservaciones.js` y `whatsappReservaciones.js` en disco, no montados | 🟢 Ghost code (ya documentado) |
| 4 | `/logout` es público — cualquiera puede destruir sesión | 🟢 Inofensivo |
