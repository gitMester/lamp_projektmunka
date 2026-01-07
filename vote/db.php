<?php
$host = 'localhost';
$user = 'web';
$pass = 'web';
$dbname = 'vote';

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Adatbázis kapcsolat sikertelen: " . $conn->connect_error]);
    exit;
}