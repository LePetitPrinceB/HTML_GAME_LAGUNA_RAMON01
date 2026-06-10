<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$host   = 'localhost';
$db     = 'laguna_ramon_db';
$user   = 'root';
$pass   = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Conexión fallida']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
    exit;
}

// Validación y sanitización
$nombre      = isset($data['nombre_jugador'])       ? trim(htmlspecialchars($data['nombre_jugador']))  : '';
$puntaje     = isset($data['puntaje_total'])         ? (int)$data['puntaje_total']                     : 0;
$tiempo      = isset($data['tiempo_total_segundos']) ? (int)$data['tiempo_total_segundos']              : 0;
$profundidad = isset($data['profundidad_maxima'])     ? (int)$data['profundidad_maxima']                : 0;
$reliquias   = isset($data['reliquias_recolectadas']) ? (int)$data['reliquias_recolectadas']            : 0;
$mejoras     = isset($data['mejoras_adquiridas'])     ? (int)$data['mejoras_adquiridas']                : 0;
$nivel       = isset($data['nivel_alcanzado'])        ? (int)$data['nivel_alcanzado']                   : 1;

if ($nombre === '' || strlen($nombre) > 50) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Nombre inválido']);
    exit;
}

$sql = "INSERT INTO tabla_records 
        (nombre_jugador, puntaje_total, tiempo_total_segundos,
         profundidad_maxima, reliquias_recolectadas, mejoras_adquiridas, nivel_alcanzado)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $pdo->prepare($sql);
$stmt->execute([$nombre, $puntaje, $tiempo, $profundidad, $reliquias, $mejoras, $nivel]);

echo json_encode([
    'ok' => true,
    'id' => $pdo->lastInsertId()
]);