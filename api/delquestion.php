$conn->begin_transaction();

try {
    // 1. Szavazatok törlése
    $stmt = $conn->prepare("DELETE FROM vote WHERE qid = ?");
    if (!$stmt) throw new Exception("DB hiba (vote): " . $conn->error);
    $stmt->bind_param("i", $qid);
    $stmt->execute();
    $stmt->close();

    // 2. Válaszok törlése
    $stmt = $conn->prepare("DELETE FROM answer WHERE qid = ?");
    if (!$stmt) throw new Exception("DB hiba (answer): " . $conn->error);
    $stmt->bind_param("i", $qid);
    $stmt->execute();
    $stmt->close();

    // 3. Kérdés törlése
    $stmt = $conn->prepare("DELETE FROM question WHERE qid = ?");
    if (!$stmt) throw new Exception("DB hiba (question): " . $conn->error);
    $stmt->bind_param("i", $qid);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        throw new Exception("A kérdés nem található.");
    }
    $stmt->close();

    $conn->commit();
    echo json_encode(["message" => "Kérdés törölve."]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}