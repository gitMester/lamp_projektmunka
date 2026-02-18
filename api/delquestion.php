<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
ini_set('html_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Csak POST kérés engedélyezett."]);
    exit;
}

require __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$qid   = intval($input['qid'] ?? 0);

if ($qid <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Hiányzó vagy érvénytelen kérdésazonosító."]);
    exit;
}

$conn->begin_transaction();

try {
    // 1. Szavazatok törlése
    $stmt = $conn->prepare("DELETE FROM vote WHERE qid = ?");
    if (!$stmt) throw new Exception("DB hiba (vote): " . $conn->error);
    $stmt->bind_param("i", $qid);
    $stmt->execute();
    $stmt->close();

    // 2. Válaszok törlése
    $stmt = $conn->prepare("DELETE FROM answer WHERE qid = ?");
    if (!$stmt) throw new Exception("DB hiba (answer): " . $conn->error);
    $stmt->bind_param("i", $qid);
    $stmt->execute();
    $stmt->close();

    // 3. Kérdés törlése
    $stmt = $conn->prepare("DELETE FROM question WHERE qid = ?");
    if (!$stmt) throw new Exception("DB hiba (question): " . $conn->error);
    $stmt->bind_param("i", $qid);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("A kérdés nem található.");
    }
    $stmt->close();

    $conn->commit();
    echo json_encode(["message" => "Kérdés törölve."]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}