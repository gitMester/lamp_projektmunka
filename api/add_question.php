<?php
session_start();
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

// Hibakezelés
ini_set('display_errors', 0);
error_reporting(0);

// Bejelentkezés ellenőrzése
if (!isset($_SESSION['uid'])) {
    echo json_encode(["error" => "Nem vagy bejelentkezve."]);
    exit;
}

// JSON input beolvasása
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["error" => "Hibás JSON formátum."]);
    exit;
}

$qtext = isset($input['qtext']) ? trim($input['qtext']) : '';
$answers = isset($input['answers']) ? $input['answers'] : [];

// Validáció
if (empty($qtext)) {
    echo json_encode(["error" => "A kérdés szövege nem lehet üres."]);
    exit;
}

if (!is_array($answers) || count($answers) < 2) {
    echo json_encode(["error" => "Legalább 2 válaszlehetőséget adj meg."]);
    exit;
}

// Üres válaszok szűrése
$answers = array_filter($answers, function($answer) {
    return !empty(trim($answer));
});

if (count($answers) < 2) {
    echo json_encode(["error" => "Legalább 2 nem üres válaszlehetőséget adj meg."]);
    exit;
}

// Tranzakció indítása
$conn->begin_transaction();

try {
    // Kérdés beszúrása
    $stmt = $conn->prepare("INSERT INTO question (qtext) VALUES (?)");
    $stmt->bind_param("s", $qtext);
    
    if (!$stmt->execute()) {
        throw new Exception("Hiba a kérdés mentése során.");
    }
    
    $qid = $conn->insert_id;
    $stmt->close();
    
    // Válaszok beszúrása
    $stmt = $conn->prepare("INSERT INTO answer (qid, atext) VALUES (?, ?)");
    
    foreach ($answers as $answer) {
        $answer = trim($answer);
        $stmt->bind_param("is", $qid, $answer);
        
        if (!$stmt->execute()) {
            throw new Exception("Hiba a válaszok mentése során.");
        }
    }
    
    $stmt->close();
    
    // Tranzakció véglegesítése
    $conn->commit();
    
    echo json_encode([
        "message" => "Kérdés sikeresen létrehozva!",
        "qid" => $qid
    ]);
    
} catch (Exception $e) {
    // Hiba esetén visszagörgetés
    $conn->rollback();
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();