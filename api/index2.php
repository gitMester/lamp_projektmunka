<?php
session_start();
require __DIR__ . './db.php'; // db csatlakozás

// Lekérjük az összes kérdést bind_result-tal
$stmt = $conn->prepare("SELECT qid, qtext FROM question ORDER BY qid ASC");
if (!$stmt) {
    die("Lekérdezési hiba: " . $conn->error);
}

$stmt->execute();
$stmt->bind_result($qid, $qtext);

$questions = [];
while ($stmt->fetch()) {
    $questions[] = [
        'qid' => (int)$qid,
        'qtext' => $qtext
    ];
}
$stmt->close();
?>
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Főoldal</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <h1>Oldal neve</h1>
    <a href="./bejelentkezes.html">Bejelentkezés</a>
    <a href="./regisztracio.html">Regisztráció</a>

    <div class="kezdooldal">
        <h2>Elérhető kérdések</h2>
        <?php if (empty($questions)): ?>
            <p>Nincsenek elérhető kérdések.</p>
        <?php else: ?>
            <?php foreach ($questions as $q): ?>
                <h3><?php echo htmlspecialchars($q['qtext']); ?> (Bejelentkezés szükséges)</h3>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <footer>
        <h2>Készítette: Kányai Márk, Léber Bence Bendegúz, Sveiczer Dávid</h2>
    </footer>
</body>
</html>
