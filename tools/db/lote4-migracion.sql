-- Lote 4: Migración de Consistencia de BD
-- Fecha: Junio 2026

-- 1. Unificar estados de habitaciones existentes a varchar descriptivo
--    (los que estaban como 0 → 'ocupada', 1 → 'disponible')
UPDATE habitaciones SET estado = 'disponible' WHERE estado IN ('1', '1 ');
UPDATE habitaciones SET estado = 'ocupada' WHERE estado IN ('0', '0 ');

-- 2. Eliminar tablas no utilizadas
DROP TABLE IF EXISTS rate_limit_attempts;
DROP TABLE IF EXISTS sessions;

-- 3. La tabla mensajes_whatsapp se conserva pero se activa desde código
--    (ya no se elimina porque los INSERTs están descomentados)
