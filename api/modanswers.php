<?php
//file_put_contents(__DIR__ . '/../debug.log', ">> MODANSWERS.PHP ELINDULT\n", FILE_APPEND);
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');
ini_set('html_errors', '0');
error_reporting(E_ALL);

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        echo json_encode(["error" => "Fatális PHP hiba: {$error['message']} ({$error['file']}:{$error['line']})"]);
        exit;
    }
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(["error" => "PHP hiba: $errstr ($errfile:$errline)"]);
    exit;
});

set_exception_handler(function(Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => "Kivétel: " . $e->getMessage()]);
    exit;
});

require __DIR__ . '/require_admin.php';
require __DIR__ . '/db.php';

// Bemenet beolvasása
$raw = file_get_contents('php://input');
//file_put_contents(__DIR__ . '/../debug.log', ">> RAW POST: $raw\n", FILE_APPEND);

$data = json_decode($raw, true);
$qid = intval($data['qid'] ?? 0);
$answers = $data['answers'] ?? [];

//file_put_contents(__DIR__ . '/../debug.log', ">> DEKÓDOLT: qid=$qid | answers=" . json_encode($answers) . "\n", FILE_APPEND);

if ($qid <= 0 || !is_array($answers) || count($answers) < 2) {
    http_response_code(400);
    echo json_encode(["error" => "Érvényes kérdésazonosító és legalább két válasz szükséges."]);
    exit;
}

// Ellenőrzés: van-e már szavazat a kérdésre?
$stmt = $conn->prepare("SELECT COUNT(*) FROM vote WHERE qid = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Lekérdezési hiba: " . $conn->error]);
    exit;
}
$stmt->bind_param("i", $qid);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

// file_put_contents(__DIR__ . '/../debug.log', ">> SZAVAZATOK SZÁMA: $count\n", FILE_APPEND);

if ($count > 0) {
    http_response_code(403);
    echo json_encode(["error" => "A kérdés már kapott szavazatot, a válaszok nem módosíthatók."]);
    exit;
}

$conn->begin_transaction();

try {
    // Régi válaszok törlése
    $stmt = $conn->prepare("DELETE FROM answer WHERE qid = ?");
    if (!$stmt) throw new Exception("Választörlési hiba: " . $conn->error);
    $stmt->bind_param("i", $qid);
    $stmt->execute();
    $stmt->close();

    // Új válaszok beszúrása
    $stmt = $conn->prepare("INSERT INTO answer (qid, atext) VALUES (?, ?)");
    if (!$stmt) throw new Exception("Válaszbeszúrási hiba: " . $conn->error);

    foreach ($answers as $atext) {
        $atext = trim($atext);
        if ($atext !== '') {
            $stmt->bind_param("is", $qid, $atext);
            $stmt->execute();
        }
    }
    $stmt->close();

    $conn->commit();
    echo json_encode(["message" => "Válaszok frissítve."]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Hiba történt: " . $e->getMessage()]);
}