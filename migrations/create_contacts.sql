-- SQL para crear tabla contacts (MySQL)
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  apellidos VARCHAR(180) NOT NULL,
  correo VARCHAR(200),
  fecha_nac DATE,
  foto TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
