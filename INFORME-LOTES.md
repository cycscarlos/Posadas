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

**Checkpoint actual:** `7bdf3d9` (Lote 3a)

### 3a — Completado ✅ (riesgo bajo)
| Actividad | Estado |
|---|---|
| `RATE_LIMIT_MAX_ATTEMPTS`, `WINDOW_MS`, `BLOCK_DURATION_MS` movidos a `.env` | ✅ |
| `loginRateLimiter.js` ahora lee de `process.env` con fallback a valores por defecto | ✅ |
| Verificación de autenticación en rutas (solo análisis, sin modificar) | ✅ |

### 3b — Pendiente (riesgo medio/alto)
| Actividad | Riesgo |
|---|---|
| Sanitización de inputs (XSS) | Medio |
| CSRF tokens | Medio |
| Helmet/CSP (re-habilitar) | Alto |
| Autenticación en rutas no protegidas | Masivo |

---

## Lote 4: Consistencia de BD ⬜

**Pendiente**

---

## Lote 5: Transacciones ⬜

**Pendiente**
