<?php
//file_put_contents(__DIR__ . '/../debug.log', ">> RESULT.PHP ELINDULT\n", FILE_APPEND);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

header('Content-Type: application/json; charset=utf-8');
session_start();

require __DIR__ . '/../db.php';

$qid = isset($_GET['qid']) ? intval($_GET['qid']) : 0;
//file_put_contents(__DIR__ . '/../debug.log', ">> QID: $qid\n", FILE_APPEND);

if ($qid <= 0) {
  echo json_encode(['error' => 'Hiányzó kérdésazonosító.']);
  exit;
}

// Lekérjük a kérdés szövegét
$stmt = $conn->prepare("SELECT qtext FROM question WHERE qid = ?");
$stmt->bind_param("i", $qid);
$stmt->execute();
$stmt->bind_result($qtext);
if (!$stmt->fetch()) {
  echo json_encode(['error' => 'A kérdés nem található.']);
  $stmt->close();
  exit;
}
$stmt->close();

// Lekérjük a válaszokat és szavazatszámokat
$stmt = $conn->prepare("
  SELECT a.aid, a.atext, COUNT(v.vid) AS votes
  FROM answer a
  LEFT JOIN vote v ON a.aid = v.aid
  WHERE a.qid = ?
  GROUP BY a.aid, a.atext
  ORDER BY a.aid
");
$stmt->bind_param("i", $qid);
$stmt->execute();
$result = $stmt->get_result();

$answers = [];
while ($row = $result->fetch_assoc()) {
  $answers[] = [
    'aid' => intval($row['aid']),
    'atext' => $row['atext'],
    'votes' => intval($row['votes'])
  ];
}
$stmt->close();

if (count($answers) === 0) {
  echo json_encode([
    'qid' => $qid,
    'qtext' => $qtext,
    'answers' => [],
    'message' => 'Ehhez a kérdéshez még nincsenek válaszok. Lehet, hogy frissítés alatt van.'
  ]);
  exit;
}

echo json_encode([
  'qid' => $qid,
  'qtext' => $qtext,
  'answers' => $answers
]);
