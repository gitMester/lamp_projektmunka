<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['uid'])) {
    echo json_encode(["loggedIn" => false]);
    exit;
}

require __DIR__ . '/db.php';

$stmt = $conn->prepare("SELECT name FROM user WHERE uid = ?");
$stmt->bind_param("i", $_SESSION['uid']);
$stmt->execute();
$stmt->bind_result($name);
$stmt->fetch();
$stmt->close();

echo json_encode([
    "loggedIn" => true,
    "name" => $name
]);
