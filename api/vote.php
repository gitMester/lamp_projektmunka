<?php
session_start();
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['uid'])) {
    echo json_encode(["error" => "Nem vagy bejelentkezve."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$qid = isset($input['qid']) ? intval($input['qid']) : null;
$aid = isset($input['aid']) ? intval($input['aid']) : null;
$uid = $_SESSION['uid'];

if ($qid === null || $aid === null) {
    echo json_encode(["error" => "Hiányzó kérdés vagy válasz."]);
    exit;
}

// Ellenőrzés: válasz a kérdéshez
$stmt = $conn->prepare("SELECT COUNT(*) FROM answer WHERE aid = ? AND qid = ?");
$stmt->bind_param("ii", $aid, $qid);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

if ($count === 0) {
    echo json_encode(["error" => "Érvénytelen válasz."]);
    exit;
}

// Szavazat rögzítése
$stmt = $conn->prepare("INSERT INTO vote (uid, qid, aid) VALUES (?, ?, ?)");
$stmt->bind_param("iii", $uid, $qid, $aid);
if ($stmt->execute()) {
    echo json_encode(["message" => "Szavazat rögzítve."]);
} else {
    echo json_encode(["error" => "Hiba történt a rögzítés során."]);
}
$stmt->close();
$conn->close();
