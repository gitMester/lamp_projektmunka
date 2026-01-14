<?php
// Adatbázis kapcsolat
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=lamp_projektmunka;charset=utf8mb4",
        "root",   // adatbázis felhasználó
        "",       // adatbázis jelszó
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    // Ha nem sikerül csatlakozni, JSON-t küldünk
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Adatbázis hiba: ' . $e->getMessage()
    ]);
    exit;
}
