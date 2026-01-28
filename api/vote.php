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

/* Ellenőrzés: válasz a kérdéshez tartozik-e */
$stmt = $conn->prepare("
    SELECT COUNT(*) 
    FROM answer 
    WHERE aid = ? AND qid = ?
");
$stmt->bind_param("ii", $aid, $qid);
$stmt->execute();
$stmt->bind_result($ok);
$stmt->fetch();
$stmt->close();

if ($ok === 0) {
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

/* Szavazat mentése */
$stmt = $conn->prepare("
    INSERT INTO vote (uid, qid, aid, ip)
    VALUES (?, ?, ?, ?)
");

$ip = $_SERVER['REMOTE_ADDR'];
$stmt->bind_param("iiis", $uid, $qid, $aid, $ip);

if ($stmt->execute()) {
    echo json_encode(["message" => "Szavazat sikeresen rögzítve."]);
} else {
    echo json_encode(["error" => "Adatbázis hiba."]);
}

$stmt->close();
$conn->close();
