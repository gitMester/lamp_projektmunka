<?php
session_start();
require __DIR__ . '/../db.php';

// mindig JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Bejelentkezés ellenőrzés
    if (!isset($_SESSION['uid'])) {
        throw new Exception("Nem vagy bejelentkezve.");
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['qid'], $data['aid'])) {
        throw new Exception("Hiányzó adatok.");
    }

    $qid = (int)$data['qid'];
    $aid = (int)$data['aid'];
    $uid = (int)$_SESSION['uid'];
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    // Ellenőrzés: válasz létezik-e a kérdéshez
    $stmt = $conn->prepare("SELECT COUNT(*) FROM answer WHERE aid=? AND qid=?");
    if (!$stmt) throw new Exception("DB hiba (prepare answer): " . $conn->error);
    $stmt->bind_param("ii", $aid, $qid);
    $stmt->execute();
    $stmt->bind_result($exists);
    $stmt->fetch();
    $stmt->close();

    if ($exists === 0) {
        throw new Exception("Érvénytelen válasz.");
    }

    // Ellenőrzés: már szavazott-e
    $stmt = $conn->prepare("SELECT COUNT(*) FROM vote WHERE uid=? AND qid=?");
    if (!$stmt) throw new Exception("DB hiba (prepare vote check): " . $conn->error);
    $stmt->bind_param("ii", $uid, $qid);
    $stmt->execute();
    $stmt->bind_result($voted);
    $stmt->fetch();
    $stmt->close();

    if ($voted > 0) {
        throw new Exception("Erre a kérdésre már szavaztál.");
    }

    // Szavazat mentése
    $stmt = $conn->prepare("INSERT INTO vote (uid,qid,aid,ip) VALUES (?,?,?,?)");
    if (!$stmt) throw new Exception("DB hiba (prepare insert): " . $conn->error);
    $stmt->bind_param("iiis", $uid, $qid, $aid, $ip);

    if (!$stmt->execute()) {
        throw new Exception("DB hiba (insert): " . $stmt->error);
    }

    echo json_encode(["message" => "Szavazat sikeresen rögzítve."]);

    $stmt->close();
    $conn->close();

} catch(Exception $e) {
    // Ha bármi hiba van, 500, de JSON
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
