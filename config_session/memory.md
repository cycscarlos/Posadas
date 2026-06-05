# Memory

## Contexto de la sesión
- Proyecto: Sistema de Gestión Hotelera — Posadas
- Estado: Lotes 1-5 completados + Opción A (autenticación redundante limpia)
- Git: `efe4ce1` — Opción A: Limpiar authenticate redundante
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

## Pendientes para próxima sesión
- [ ] **Opción B**: Agregar `authorize` a rutas sensibles (usar reporte en `tools/reportes/auditoria-autenticacion.md`)
- [ ] Bug `:id:url` en `consultaClienteCalendario.js`
- [ ] Doble mount `checkServerDB.js` en `router.js`
- [ ] Dead deps: `winston`, `winston-daily-rotate-file`, `date-fns`
- [ ] `morgan` en devDependencies pero usado en producción

## Reglas a cumplir
- No modificar código sin autorización explícita
- Consultar siempre antes de ejecutar acciones (iniciar/detener servicios, probar, modificar)
- Checkpoint antes de cambios masivos; backup antes de cambios individuales
