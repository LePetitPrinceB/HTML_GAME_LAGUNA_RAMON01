# HTML_GAME_LAGUNA_RAMON01

#Manual de Despliegue e Instalación
#Bienvenidos
Requisitos del Entorno
•	Servidor web Apache (incluido en XAMPP).
•	PHP 8.0 o superior (con extensión PDO habilitada).
•	MySQL
Instrucciones de Instalación
1.	Clonar el repositorio: Ubica los archivos del proyecto en el directorio raíz de tu servidor local (ej. htdocs/laguna-ramon/). Si cambias el nombre de la carpeta, debes actualizar la ruta del fetch en la línea 81 de game.js (/laguna-ramon/api/guardar_record.php).
2.	Inicializar Base de Datos:
o	Abre phpMyAdmin o tu cliente SQL preferido.
o	Ejecuta el script contenido en db/schema.sql para crear la base de datos laguna_ramon_db y la tabla tabla_records.
3.	Verificar Credenciales: Edita el archivo api/guardar_record.php y asegúrate de que las variables $user y $pass coincidan con la configuración de tu entorno local (por defecto en XAMPP: $user = 'root', $pass = '').
