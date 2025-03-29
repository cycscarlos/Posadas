-- Tabla para almacenar tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT(11) NOT NULL AUTO_INCREMENT,
  user_id INT(11) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used TINYINT(1) DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  INDEX (user_id),
  INDEX (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Añadir restricción de clave foránea
ALTER TABLE password_reset_tokens
ADD CONSTRAINT fk_password_reset_tokens_user_id
FOREIGN KEY (user_id) REFERENCES login (id)
ON DELETE CASCADE;

-- Comentario para explicar la tabla
INSERT INTO INFORMATION_SCHEMA.TABLES_COMMENTS 
SELECT 'posada_db', 'password_reset_tokens', 
'Tabla para almacenar tokens de recuperación de contraseña generados cuando un usuario solicita restablecer su contraseña. Estos tokens tienen un tiempo de expiración y se marcan como utilizados después de su uso.'
WHERE NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES_COMMENTS 
    WHERE TABLE_SCHEMA = 'posada_db' AND TABLE_NAME = 'password_reset_tokens'
); 