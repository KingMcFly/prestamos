CREATE DATABASE IF NOT EXISTS tuniche_db;
USE tuniche_db;

-- Tabla de Empleados
CREATE TABLE IF NOT EXISTS empleados (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    area VARCHAR(100),
    turno ENUM('A', 'B', 'C', 'Administrativo') DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Equipos
CREATE TABLE IF NOT EXISTS equipos (
    id VARCHAR(36) PRIMARY KEY,
    serie VARCHAR(100) UNIQUE,
    tipo VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    valor INT DEFAULT 0,
    estado ENUM('disponible', 'prestado', 'mantenimiento', 'baja') DEFAULT 'disponible',
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Préstamos (Cabecera)
CREATE TABLE IF NOT EXISTS prestamos (
    id VARCHAR(36) PRIMARY KEY,
    fecha DATE NOT NULL,
    empleado_id VARCHAR(36) NOT NULL,
    observaciones TEXT,
    valor_total INT DEFAULT 0,
    estado ENUM('activo', 'devuelto') DEFAULT 'activo',
    firma_base64 LONGTEXT,
    generado_por VARCHAR(100),
    
    -- Campos de devolución
    fecha_devolucion DATE NULL,
    recibido_por VARCHAR(100) NULL,
    observaciones_devolucion TEXT NULL,
    firma_devolucion LONGTEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);

-- Tabla de Items del Préstamo (Detalle)
CREATE TABLE IF NOT EXISTS prestamos_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestamo_id VARCHAR(36) NOT NULL,
    equipo_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);