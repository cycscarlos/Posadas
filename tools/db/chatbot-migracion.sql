-- Migración chatbot: columna precio en habitaciones + tabla promociones
-- Ejecutar: mysql -u root -p posadas < tools/db/chatbot-migracion.sql

ALTER TABLE habitaciones
  ADD COLUMN precio DECIMAL(10,2) AFTER capacidad;

CREATE TABLE promociones (
  id_promocion INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  activo TINYINT(1) DEFAULT 1
);
