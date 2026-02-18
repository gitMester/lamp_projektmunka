<?php
// Hibakezelés éles környezethez
error_reporting(E_ALL);
ini_set('display_errors', 0); // Ne jelenjen meg a kliensnek
ini_set('log_errors', 1);

require __DIR__ . './db.php'; // db.php NE írjon ki semmit, és ne legyen a végén

header('Content-Type: application/json; charset=utf-8');

// Csak POST metódus engedélyezett
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Nem támogatott metódus"
    ]);
    exit;
}

// JSON bemenet beolvasása
$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['username'] ?? '');
$pass = trim($data['password'] ?? '');

if ($name === '' || $pass === '') {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Név és jelszó megadása kötelező"
    ]);
    exit;
}

// Ellenőrzés: név már létezik-e
$stmt = $conn->prepare("SELECT COUNT(*) FROM user WHERE name = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Lekérdezési hiba: " . $conn->error
    ]);
    exit;
}
$stmt->bind_param("s", $name);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

if ($count > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "Ez a felhasználónév már foglalt"
    ]);
    exit;
}

// Jelszó hash-elése
$hashed = password_hash($pass, PASSWORD_DEFAULT);
$ip = $_SERVER['REMOTE_ADDR'] ?? '';

// Felhasználó mentése
$stmt = $conn->prepare("INSERT INTO user (name, pass, ip) VALUES (?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Mentési hiba: " . $conn->error
    ]);
    exit;
}
$stmt->bind_param("sss", $name, $hashed, $ip);
$stmt->execute();
$uid = $stmt->insert_id;
$stmt->close();

// Sikeres válasz
http_response_code(201);
echo json_encode([
    "success" => true,
    "message" => "Felhasználó létrehozva",
    "id" => $uid,
    "name" => $name,
    "ip" => $ip
]);
