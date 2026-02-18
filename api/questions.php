<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
ini_set('html_errors', 0);
error_reporting(E_ALL);

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(["error" => "PHP hiba: $errstr ($errfile:$errline)"]);
    exit;
});

require __DIR__ . '/require_login.php';
require __DIR__ . '/db.php';

$stmt = $conn->prepare("
    SELECT q.qid, q.qtext, COUNT(*) AS vote_count
    FROM question q
    LEFT JOIN vote v ON v.qid = q.qid
    GROUP BY q.qid, q.qtext
    ORDER BY q.qid DESC
");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Lekérdezési hiba: " . $conn->error]);
    exit;
}

$stmt->execute();
$stmt->bind_result($qid, $qtext, $vote_count);

$questions = [];
while ($stmt->fetch()) {
    $questions[] = [
        "qid"        => (int)$qid,
        "qtext"      => $qtext,
        "vote_count" => (int)$vote_count
    ];
}

$stmt->close();
echo json_encode($questions);