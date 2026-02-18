<?php
session_start();
require __DIR__ . '/db.php';

header('Content-Type: application/json');

// Mindig 200-at adunk vissza, még hibánál is
http_response_code(200);

$qid = isset($_GET['qid']) ? intval($_GET['qid']) : 0;

if ($qid > 0) {
  $stmt = $conn->prepare("SELECT qid, qtext FROM question WHERE qid = ?");
  $stmt->bind_param("i", $qid);
  $stmt->execute();
  $result = $stmt->get_result();
  if ($row = $result->fetch_assoc()) {
    $question = $row;
  } else {
    echo json_encode(["error" => "A kérdés nem található."]);
    exit;
  }
} else {
  $result = $conn->query("SELECT qid, qtext FROM question ORDER BY qid DESC LIMIT 1");
  if ($row = $result->fetch_assoc()) {
    $question = $row;
  } else {
    echo json_encode(["error" => "Nincs elérhető kérdés."]);
    exit;
  }
}

$qid = $question['qid'];
$qtext = $question['qtext'];

$stmt = $conn->prepare("SELECT aid, atext FROM answer WHERE qid = ?");
$stmt->bind_param("i", $qid);
$stmt->execute();
$res = $stmt->get_result();

$answers = [];
while ($row = $res->fetch_assoc()) {
  $answers[] = $row;
}

echo json_encode([
  "qid" => $qid,
  "qtext" => $qtext,
  "answers" => $answers
]);
