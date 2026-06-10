# Laguna Ramón en Piura
**Manual de Despliegue e Instalación**

Bienvenidos al repositorio oficial del videojuego web "El Encanto de la Laguna de Ramón". Este proyecto implementa un motor de renderizado 2D en HTML5 Canvas acoplado a una arquitectura cliente-servidor para la persistencia asíncrona de métricas.

---

## ⚙️ Requisitos del Entorno

Para ejecutar el entorno de desarrollo con funcionalidad de backend completa, se requiere el siguiente stack tecnológico:

* **Servidor Web:** Apache (incluido en plataformas como XAMPP).
* **Backend:** PHP 8.0 o superior (requiere extensión `PDO` habilitada).
* **Motor de Base de Datos:** MySQL.

---

## 🚀 Instrucciones de Instalación

### 1. Despliegue del Repositorio
Ubique los archivos del proyecto en el directorio público de su servidor local (por ejemplo, `C:/xampp/htdocs/laguna-ramon/`).

> **Advertencia de Enrutamiento:** Si modifica el nombre del directorio raíz (`laguna-ramon`), deberá actualizar obligatoriamente la ruta absoluta de la petición `fetch` en la línea 81 del archivo `js/game.js`:
> ```javascript
> const res = await fetch('/laguna-ramon/api/guardar_record.php', { ... });
> ```

### 2. Inicialización de la Base de Datos
1. Acceda a **phpMyAdmin** o a su cliente SQL de preferencia.
2. Ejecute el script DDL contenido en `db/schema.sql`. Esto automatizará la creación de la base de datos `laguna_ramon_db` y la estructura de la tabla `tabla_records`.

### 3. Configuración de Credenciales
Abra el controlador backend ubicado en `api/guardar_record.php` y verifique que los parámetros de conexión coincidan con su entorno local. La configuración estándar para una instalación limpia de XAMPP es:

```php
$host   = 'localhost';
$db     = 'laguna_ramon_db';
$user   = 'root';
$pass   = '';
