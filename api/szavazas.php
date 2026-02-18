<?php
session_start();
require __DIR__ . '../db.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['uid'])) {
    echo json_encode(["error" => "Nem vagy bejelentkezve."]);
    exit;
}

// Legutóbbi kérdés
$result = $conn->query("SELECT qid, qtext FROM question ORDER BY qid DESC LIMIT 1");
if (!$result || $result->num_rows === 0) {
    echo json_encode(["error" => "Nincs elérhető kérdés."]);
    exit;
}
$question = $result->fetch_assoc();
$qid = (int)$question['qid'];

// Válaszok
$stmt = $conn->prepare("SELECT aid, atext FROM answer WHERE qid = ?");
$stmt->bind_param("i", $qid);
$stmt->execute();
$res = $stmt->get_result();
$answers = [];
while ($row = $res->fetch_assoc()) $answers[] = $row;
$stmt->close();

echo json_encode([
    "qid" => $qid,
    "qtext" => $question['qtext'],
    "answers" => $answers
]);
$conn->close();
