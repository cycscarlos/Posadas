-- Optimización de base de datos para el sistema de reservaciones
-- Este script añade índices para mejorar el rendimiento de las consultas

-- Verificar si los índices ya existen para evitar errores
SET @exists_idx_fecha_entrada = (
    SELECT COUNT(1) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'posada_db' 
    AND TABLE_NAME = 'reservas' 
    AND INDEX_NAME = 'idx_fecha_entrada'
);

SET @exists_idx_fecha_salida = (
    SELECT COUNT(1) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'posada_db' 
    AND TABLE_NAME = 'reservas' 
    AND INDEX_NAME = 'idx_fecha_salida'
);

SET @exists_idx_estado_reserva = (
    SELECT COUNT(1) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'posada_db' 
    AND TABLE_NAME = 'reservas' 
    AND INDEX_NAME = 'idx_estado'
);

SET @exists_idx_id_habitacion = (
    SELECT COUNT(1) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'posada_db' 
    AND TABLE_NAME = 'reservas' 
    AND INDEX_NAME = 'idx_id_habitacion'
);

-- Añadir índices a la tabla reservas si no existen
DROP PROCEDURE IF EXISTS add_indices;
DELIMITER //
CREATE PROCEDURE add_indices()
BEGIN
    -- Índice para fecha_entrada (mejora búsquedas por fecha)
    IF @exists_idx_fecha_entrada = 0 THEN
        ALTER TABLE reservas ADD INDEX idx_fecha_entrada (fecha_entrada);
        SELECT 'Índice idx_fecha_entrada creado con éxito.' AS message;
    ELSE 
        SELECT 'El índice idx_fecha_entrada ya existe.' AS message;
    END IF;
    
    -- Índice para fecha_salida (mejora búsquedas por fecha)
    IF @exists_idx_fecha_salida = 0 THEN
        ALTER TABLE reservas ADD INDEX idx_fecha_salida (fecha_salida);
        SELECT 'Índice idx_fecha_salida creado con éxito.' AS message;
    ELSE 
        SELECT 'El índice idx_fecha_salida ya existe.' AS message;
    END IF;
    
    -- Índice para estado (mejora filtrado por estado)
    IF @exists_idx_estado_reserva = 0 THEN
        ALTER TABLE reservas ADD INDEX idx_estado (estado);
        SELECT 'Índice idx_estado creado con éxito.' AS message;
    ELSE 
        SELECT 'El índice idx_estado ya existe.' AS message;
    END IF;
    
    -- Índice para id_habitacion (mejora joins con tabla habitaciones)
    IF @exists_idx_id_habitacion = 0 THEN
        ALTER TABLE reservas ADD INDEX idx_id_habitacion (id_habitacion);
        SELECT 'Índice idx_id_habitacion creado con éxito.' AS message;
    ELSE 
        SELECT 'El índice idx_id_habitacion ya existe.' AS message;
    END IF;
    
    -- Índice combinado para búsquedas comunes (habitación + fechas)
    -- Este índice mejora significativamente la verificación de disponibilidad
    ALTER TABLE reservas ADD INDEX idx_habitacion_fechas (id_habitacion, fecha_entrada, fecha_salida, estado);
    SELECT 'Índice idx_habitacion_fechas creado/reemplazado con éxito.' AS message;
END //
DELIMITER ;

-- Ejecutar el procedimiento
CALL add_indices();

-- Limpiar
DROP PROCEDURE IF EXISTS add_indices; 