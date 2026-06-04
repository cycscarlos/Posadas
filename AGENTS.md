# Posadas - Sistema de Gestión Hotelera

## Stack
- **Runtime:** Node.js, Express 4.21, EJS (SSR, no SPA)
- **DB:** MySQL 8 via `mysql2` pool (10 conn), **no ORM/model layer** — raw SQL in controllers
- **Frontend:** Bootstrap 5, jQuery 3.7.1, DataTables, Chart.js, SweetAlert2

## Dev Commands
| Command | Use |
|---|---|
| `npm run dev` | nodemon dev server |
| `npm run watch` | Node.js `--watch` mode |
| `npm start` | Production start |

## Architecture
- **Entrypoint:** `index.js` (loads `env/.env`, `src/config.js`)
- **Router orchestrator:** `src/router.js` mounts all route files
- **Pattern:** Thin routes → fat controllers (business logic + raw SQL) → EJS views
- **DB wrapper:** `src/database/db.js` exports `query()`, `getConnection()`, `transaction()`
- **Automation:** `node-cron` `0 * * * *` + `executeOnServerStart()` in `index.js`
- **Middleware pipeline:** Helmet → Session → CSRF → Rate Limiter → Auth → Controller

## Critical Conventions
- **Env file location:** `env/.env` (not root) — loaded at `index.js` line 1 via `dotenv.config({ path: 'env/.env' })`
- **View engine:** EJS, views at `src/views/`
- **Static files:** `public/` served at `/`
- **Session:** MemoryStore (lost on restart), httpOnly, 1hr maxAge. DB `sessions` table exists but unused.
- **Route mount order in `index.js`:** `checkServerDB` (root `/`) → `home` (`/home`) → `mainRouter` (everything else)
- **Login rate limiter:** in-memory `Map` (5 attempts / 15min window / 30min block). DB `rate_limit_attempts` table exists but unused.
- **Helmet CSP:** enabled with directives for CDNs, Google Fonts, Font Awesome
- **Controllers:** 26 files, `ctrl_<feature>.js`. Named function exports `(req, res)`.
- **Routes:** 27 active files, thin Express routers. `reservaciones.js` and `whatsappReservaciones.js` exist on disk but are **commented out** in `router.js` (ghost code — would crash if re-enabled, controllers don't exist).

## Known Issues (do not fix without authorization)
- **3 dead deps:** `winston`, `winston-daily-rotate-file`, `date-fns` — installed, never imported
- **morgan:** in `devDependencies` but used in production (`index.js:90`)
- **No tests:** no Jest/Mocha — manual testing only
- **Dead tables:** `rate_limit_attempts`, `sessions` — eliminadas vía migración SQL (ver `tools/db/lote4-migracion.sql`)

## DB Schema (10 tables)
`clientes`, `habitaciones`, `login`, `reservas`, `pagos`, `metodos_pago`, `mensajes_whatsapp`, `password_reset_tokens`, `rate_limit_attempts`, `sessions`

## Project State (INFORME-LOTES.md)
- ✅ Lote 1: bcrypt + session regeneration
- ✅ Lote 2: cleanup (−928 lines, 12 files)
- ✅ Lote 3a: rate limit to env vars
- ✅ Lote 3b: sanitization, CSRF, CSP, route auth
- ✅ Lote 4: DB consistency
- ⬜ Lote 5: transactions

## Session Config (opencode.json)
- `instructions` point to `config_session/rules.md` and `config_session/memory.md`
- Rules require: backup before edits (`backups/<file>.<YYYYMMDD-HHmmss>.bak`), checkpoint before mass changes, ask before actions
