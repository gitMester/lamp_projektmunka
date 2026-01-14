<?php
header('Content-Type: application/json');

require 'db.php';

/*
 * JSON body beolvasása
 * (ugyanaz, mint Express-ben: req.body)
 */
$data = json_decode(file_get_contents('php://input'), true);

/* Alap validáció */
if (
    !isset($data['username']) ||
    !isset($data['email']) ||
    !isset($data['password'])
) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Hiányzó adatok'
    ]);
    exit;
}

/* Adatok kimentése */
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

/* Jelszó hash */
$hash = password_hash($password, PASSWORD_DEFAULT);

/* SQL beszúrás */
$stmt = $pdo->prepare(
    'INSERT INTO users (username, email, password)
     VALUES (:username, :email, :password)'
);

$stmt->execute([
    'username' => $username,
    'email'    => $email,
    'password' => $hash
]);

/* Válasz */
echo json_encode([
    'status' => 'success',
    'message' => 'Sikeres regisztráció'
]);
