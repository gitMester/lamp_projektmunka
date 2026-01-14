<?php
header('Content-Type: application/json');

// Fejlesztői hibák debug-hoz
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'config.php';

// JSON body beolvasása
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['username'], $data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Hiányzó adatok'
    ]);
    exit;
}

$username = trim($data['username']);
$email    = trim($data['email']);
$password = $data['password'];

if ($username === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Üres mező nem megengedett'
    ]);
    exit;
}

// Duplikált email/felhasználónév ellenőrzése
try {
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email OR username = :username");
    $check->execute(['email' => $email, 'username' => $username]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode([
            'status' => 'error',
            'message' => 'Ez az email vagy felhasználónév már foglalt'
        ]);
        exit;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Adatbázis hiba: ' . $e->getMessage()
    ]);
    exit;
}

// Jelszó hash
$hash = password_hash($password, PASSWORD_DEFAULT);

// SQL beszúrás
try {
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (:username, :email, :password)");
    $stmt->execute([
        'username' => $username,
        'email'    => $email,
        'password' => $hash
    ]);
    echo json_encode([
        'status' => 'success',
        'message' => 'Sikeres regisztráció'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Adatbázis hiba: ' . $e->getMessage()
    ]);
}
