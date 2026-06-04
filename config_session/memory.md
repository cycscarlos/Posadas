# Memory

## Contexto de la sesión
- Proyecto: Sistema de Gestión Hotelera — Posadas
- Estado: Lote 1 completado (junio 2026)
- Git: checkpoint `c3ee92c` — Lote 1 finalizado
- MySQL: Servicio WAMP MySQL 8.4.7 activo
- Servidor Node: Corriendo en http://localhost:3000

## Logros
- ✅ Hashes bcrypt reales para `admin` (admin) y `recepcion1` (recepcion1)
- ✅ `req.session.regenerate()` agregado en ctrl_login.js (anti session fixation)
- ✅ Verificación de login exitosa con ambos usuarios

## Pendientes
- [ ] Lote 2: Limpieza de código
- [ ] Lote 3: Configuración y seguridad
- [ ] Lote 4: Consistencia de BD
- [ ] Lote 5: Transacciones

## Reglas a cumplir
- No modificar código sin autorización explícita
- Consultar siempre antes de ejecutar acciones (iniciar/detener servicios, probar, modificar)
- Checkpoint antes de cambios masivos; backup antes de cambios individuales
