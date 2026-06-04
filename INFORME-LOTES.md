# Informe de Actividades — Sistema Posadas

## Estado Actual

| Aspecto | Estado |
|---|---|
| Servidor Node.js | http://localhost:3000 |
| MySQL | WAMP 8.4.7 |
| Git | Main branch |
| Checkpoint actual | `7bdf3d9` (Lote 3a) |

---

## Lote 1: Acceso ✅

**Commit:** `c3ee92c`

| Actividad | Estado |
|---|---|
| Hashes bcrypt reales para admin/admin y recepcion1/recepcion1 | ✅ |
| `req.session.regenerate()` en ctrl_login.js (anti session fixation) | ✅ |
| Verificación de login con ambos roles | ✅ |

---

## Lote 2: Limpieza de Código ✅

**Commit:** `3961910` — +17 / −928 líneas, 12 archivos

| Archivo eliminado | Líneas | Motivo |
|---|---|---|
| `src/middlewares/LeChat_automatizacionEstados.js` | 351 | Legacy AI, superseded |
| `src/middlewares/conNodemailer-automatizacionEstados.js` | 281 | Legacy con nodemailer |
| `src/middlewares/formatDate.js` | 13 | No importado |

| Archivo limpiado | Cambio |
|---|---|
| `ctrl_administracionManualEstados.js` | −130 líneas comentarios legacy |
| `ctrl_pagos.js` | −47 líneas función comentada |
| `ctrl_historialHabitaciones.js` | −99 líneas función comentada |
| `preReservaciones.js` | Rutas comentadas eliminadas |
| `router.js` | Import `conexion` no usado + comentarios |
| `ctrl_login.js` | Import `path` no usado |
| `ctrl_menu.js` | Imports `path` y `bcryptjs` no usados |
| `authenticate.js` | Log seguro (no expone hash) |
| `ctrl_whatsappEnvioMsgs.js` | Modos de test a variables de entorno |
| `env/.env` | `WHATSAPP_TEST_MODE`, `WHATSAPP_SEMI_TEST_MODE` |

---

## Lote 3: Configuración y Seguridad 🔄 (en progreso)

**Checkpoint Lote 3a:** `7bdf3d9`
**Checkpoint Lote 3b:** `6c4aefb`

### 3a — Completado ✅ (riesgo bajo)
| Actividad | Estado |
|---|---|
| `RATE_LIMIT_MAX_ATTEMPTS`, `WINDOW_MS`, `BLOCK_DURATION_MS` movidos a `.env` | ✅ |
| `loginRateLimiter.js` ahora lee de `process.env` con fallback a valores por defecto | ✅ |
| Verificación de autenticación en rutas (solo análisis, sin modificar) | ✅ |

### 3b — Completado ✅ (riesgo medio/alto)
| Actividad | Cambio realizado |
|---|---|
| Sanitización de inputs (XSS) | ✅ `src/middlewares/sanitizeInput.js` — elimina tags HTML de req.body |
| CSRF tokens | ✅ `src/middlewares/csrfProtection.js` + inyector JS en todas las vistas |
| Helmet/CSP (re-habilitar) | ✅ CSP configurado con directivas para CDNs, Google Fonts, Font Awesome |
| Autenticación en rutas no protegidas | ✅ `router.js` reestructurado: rutas públicas primero, `authenticate` después |

---

## Lote 4: Consistencia de BD ✅

**Checkpoint:** `dd1be70`

| Actividad | Cambio realizado |
|---|---|
| C1: `habitaciones.estado` unificado a varchar descriptivo | ✅ 11 archivos actualizados (`0`→`'ocupada'`, `1`→`'disponible'`) |
| C2: Orden DELETE en depuración | ✅ `ctrl_depuracion.js`: pagos → metodos_pago → reservas |
| G1: JOIN inválido password reset | ✅ `ctrl_passwordReset.js`: eliminado JOIN login↔clientes |
| G2: Restaurar estado al eliminar | ✅ Incluido en C1 |
| M1: Unificar registro vs registroModal | ✅ `ctrl_registroModal.js`: agregado ELSE para fechas futuras |
| M2: Comparación muerta en automatización | ✅ `automatizacionEstados.js`: `=== 0` → `=== 'ocupada'` |
| M3: Tablas muertas | ✅ SQL migración en `tools/db/lote4-migracion.sql` |
| B1-B4: Correcciones menores | ✅ `cedula` sin parseInt, etiqueta procedencia, redundancia IS NULL |
| WhatsApp INSERTs activados | ✅ `ctrl_whatsappEnvioMsgs.js`: descomentados ambos INSERTs |

---

## Lote 5: Transacciones ⬜

**Pendiente**
