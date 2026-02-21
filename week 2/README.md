DROP DATABASE IF EXISTS gestion_academica_universidad;
CREATE DATABASE gestion_academica_universidad;
USE gestion_academica_universidad;

CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    genero VARCHAR(10),
    identificacion INT NOT NULL UNIQUE,
    carrera VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    fecha_ingreso DATE NOT NULL
);

CREATE TABLE docentes (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_institucional VARCHAR(100) NOT NULL UNIQUE,
    departamento_academico VARCHAR(100),
    anios_experiencia INT CHECK (anios_experiencia >= 0)
);

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    creditos INT CHECK (creditos > 0),
    semestre INT CHECK (semestre > 0),
    id_docente INT,
    FOREIGN KEY (id_docente)
        REFERENCES docentes(id_docente)
        ON DELETE SET NULL
);

CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    calificacion_final DECIMAL(4,2) CHECK (calificacion_final BETWEEN 0 AND 5),
    FOREIGN KEY (id_estudiante)
        REFERENCES estudiantes(id_estudiante)
        ON DELETE CASCADE,
    FOREIGN KEY (id_curso)
        REFERENCES cursos(id_curso)
        ON DELETE CASCADE
);

INSERT INTO estudiantes
(nombre_completo, correo_electronico, genero, identificacion, carrera, fecha_nacimiento, fecha_ingreso)
VALUES
('Juan Pérez', 'juan@mail.com', 'M', 1001, 'Ingeniería de Sistemas', '2002-05-14', '2022-01-15'),
('María Gómez', 'maria@mail.com', 'F', 1002, 'Administración', '2001-08-20', '2021-02-10'),
('Carlos López', 'carlos@mail.com', 'M', 1003, 'Contaduría', '2000-11-03', '2020-01-20'),
('Laura Díaz', 'laura@mail.com', 'F', 1004, 'Ingeniería de Sistemas', '2003-02-10', '2023-01-15'),
('Andrés Ruiz', 'andres@mail.com', 'M', 1005, 'Administración', '2002-09-18', '2022-01-15');

INSERT INTO docentes
(nombre_completo, correo_institucional, departamento_academico, anios_experiencia)
VALUES
('Ana Torres', 'ana@uni.edu', 'Ingeniería', 10),
('Luis Martínez', 'luis@uni.edu', 'Administración', 7),
('Pedro Ramírez', 'pedro@uni.edu', 'Contabilidad', 12);

INSERT INTO cursos
(nombre, codigo, creditos, semestre, id_docente)
VALUES
('Base de Datos', 'BD101', 4, 2, 1),
('Administración I', 'ADM101', 3, 1, 2),
('Contabilidad Básica', 'CON101', 3, 1, 3),
('Programación Avanzada', 'PRO201', 4, 3, 1);

INSERT INTO inscripciones
(id_estudiante, id_curso, fecha_inscripcion, calificacion_final)
VALUES
(1, 1, '2024-01-20', 4.5),
(1, 2, '2024-01-20', 4.0),
(2, 1, '2024-01-21', 4.8),
(3, 3, '2024-01-22', 3.9),
(4, 1, '2024-01-25', 4.2),
(4, 4, '2024-01-26', 4.7),
(5, 2, '2024-01-27', 3.8),
(5, 4, '2024-01-28', 4.1);

SELECT e.nombre_completo, c.nombre AS curso
FROM estudiantes e
JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso;

SELECT c.nombre, d.nombre_completo
FROM cursos c
JOIN docentes d ON c.id_docente = d.id_docente
WHERE d.anios_experiencia > 5;

SELECT c.nombre,
       ROUND(AVG(i.calificacion_final),2) AS promedio
FROM inscripciones i
JOIN cursos c ON i.id_curso = c.id_curso
GROUP BY c.id_curso;

SELECT e.nombre_completo,
       COUNT(i.id_curso) AS total_cursos
FROM inscripciones i
JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
GROUP BY e.id_estudiante
HAVING COUNT(i.id_curso) > 1;

ALTER TABLE estudiantes
ADD estado_academico VARCHAR(20) DEFAULT 'Activo';

DELETE FROM docentes WHERE id_docente = 1;

SELECT * FROM cursos;

SELECT e.nombre_completo,
       ROUND(AVG(i.calificacion_final),2) AS promedio
FROM inscripciones i
JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
GROUP BY e.id_estudiante
HAVING AVG(i.calificacion_final) >
(
    SELECT AVG(calificacion_final)
    FROM inscripciones
);

SELECT DISTINCT carrera
FROM estudiantes
WHERE id_estudiante IN (
    SELECT id_estudiante
    FROM inscripciones i
    JOIN cursos c ON i.id_curso = c.id_curso
    WHERE c.semestre >= 2
);

SELECT 
    ROUND(AVG(calificacion_final),2) AS promedio_general,
    MAX(calificacion_final) AS nota_maxima,
    MIN(calificacion_final) AS nota_minima,
    COUNT(*) AS total_notas
FROM inscripciones;

CREATE VIEW vista_historial_academico AS
SELECT 
    e.nombre_completo AS estudiante,
    c.nombre AS curso,
    d.nombre_completo AS docente,
    c.semestre,
    i.calificacion_final
FROM inscripciones i
JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
JOIN cursos c ON i.id_curso = c.id_curso
LEFT JOIN docentes d ON c.id_docente = d.id_docente;

SELECT * FROM vista_historial_academico;

DROP ROLE IF EXISTS revisor_academico;
CREATE ROLE revisor_academico;

GRANT SELECT ON gestion_academica_universidad.vista_historial_academico 
TO revisor_academico;

GRANT INSERT, UPDATE, DELETE 
ON gestion_academica_universidad.inscripciones 
TO revisor_academico;

REVOKE INSERT, UPDATE, DELETE 
ON gestion_academica_universidad.inscripciones 
FROM revisor_academico;

START TRANSACTION;

UPDATE inscripciones
SET calificacion_final = 2.0
WHERE id_inscripcion = 1;

SAVEPOINT punto1;

UPDATE inscripciones
SET calificacion_final = 5.0
WHERE id_inscripcion = 2;

ROLLBACK TO punto1;

COMMIT;

SELECT id_inscripcion, calificacion_final
FROM inscripciones
WHERE id_inscripcion IN (1,2);