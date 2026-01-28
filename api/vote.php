<?php
session_start();
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['uid'])) {
    echo json_encode(["error" => "Nem vagy bejelentkezve."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['qid'], $data['aid'])) {
    echo json_encode(["error" => "Hiányzó adatok."]);
    exit;
}

$qid = (int)$data['qid'];
$aid = (int)$data['aid'];
$uid = (int)$_SESSION['uid'];

/* Ellenőrzés: létezik-e a válasz ehhez a kérdéshez */
$stmt = $conn->prepare("
    SELECT COUNT(*) 
    FROM answer 
    WHERE aid = ? AND qid = ?
");
$stmt->bind_param("ii", $aid, $qid);
$stmt->execute();
$stmt->bind_result($exists);
$stmt->fetch();
$stmt->close();

if ($exists === 0) {
    echo json_encode(["error" => "Érvénytelen válasz."]);
    exit;
}

/* Ellenőrzés: már szavazott-e */
$stmt = $conn->prepare("
    SELECT COUNT(*) 
    FROM vote 
    WHERE uid = ? AND qid = ?
");
$stmt->bind_param("ii", $uid, $qid);
$stmt->execute();
$stmt->bind_result($voted);
$stmt->fetch();
$stmt->close();

if ($voted > 0) {
    echo json_encode(["error" => "Erre a kérdésre már szavaztál."]);
    exit;
}

/* Szavazat rögzítése */
$stmt = $conn->prepare("
    INSERT INTO vote (uid, qid, aid)
    VALUES (?, ?, ?)
");
$stmt->bind_param("iii", $uid, $qid, $aid);

if ($stmt->execute()) {
    echo json_encode(["message" => "Szavazat sikeresen rögzítve."]);
} else {
    echo json_encode(["error" => "Adatbázis hiba történt."]);
}

$stmt->close();
$conn->close();
