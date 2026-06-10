CREATE DATABASE IF NOT EXISTS laguna_ramon_db;
USE laguna_ramon_db;

CREATE TABLE IF NOT EXISTS tabla_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_jugador VARCHAR(50) NOT NULL,
    puntaje_total INT NOT NULL,
    tiempo_total_segundos INT NOT NULL,
    profundidad_maxima INT NOT NULL,
    reliquias_recolectadas INT NOT NULL,
    mejoras_adquiridas INT NOT NULL,
    nivel_alcanzado INT DEFAULT 1,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;