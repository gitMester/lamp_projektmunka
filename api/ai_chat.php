<?php
/**
 * ai_chat.php — AI Chatbot backend proxy
 * Szavazós oldal kontextusával kiegészített Claude API hívás
 *
 * Helyezd el: api/ai_chat.php
 * FONTOS: Az ANTHROPIC_API_KEY-t állítsd be lent, vagy környezeti változóként.
 */

session_start();
require __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS preflight kezelés
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Csak POST kérés engedélyezett.']);
    exit;
}

require_once __DIR__ . '/../.env.php';
$ANTHROPIC_API_KEY = ANTHROPIC_API_KEY;

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Hiányzó üzenet.']);
    exit;
}

$userMessage  = trim(strip_tags($input['message']));
$qid          = isset($input['qid']) ? (int)$input['qid'] : null;
$conversation = isset($input['history']) ? $input['history'] : [];

// ── Aktuális kérdés + szavazatok lekérése kontextushoz ──
$contextText = '';
if ($qid) {
    $stmt = $conn->prepare("SELECT qtext FROM question WHERE qid = ?");
    $stmt->bind_param("i", $qid);
    $stmt->execute();
    $stmt->bind_result($qtext);
    $stmt->fetch();
    $stmt->close();

    if ($qtext) {
        // Válaszlehetőségek és szavazatszámok
        $stmt2 = $conn->prepare("
            SELECT a.atext, COUNT(v.vid) AS cnt
            FROM answer a
            LEFT JOIN vote v ON v.aid = a.aid
            WHERE a.qid = ?
            GROUP BY a.aid, a.atext
            ORDER BY cnt DESC
        ");
        $stmt2->bind_param("i", $qid);
        $stmt2->execute();
        $res = $stmt2->get_result();
        $valaszok = [];
        $osszes   = 0;
        while ($row = $res->fetch_assoc()) {
            $valaszok[] = $row;
            $osszes += (int)$row['cnt'];
        }
        $stmt2->close();

        $contextText .= "Az aktuális szavazás kérdése: \"$qtext\"\n";
        $contextText .= "Eddigi szavazatok összesen: $osszes\n";
        $contextText .= "Eredmények:\n";
        foreach ($valaszok as $v) {
            $pct = $osszes > 0 ? round($v['cnt'] / $osszes * 100, 1) : 0;
            $contextText .= "  - {$v['atext']}: {$v['cnt']} szavazat ($pct%)\n";
        }
    }
}

// ── Összes aktív szavazás rövid listája ──
$stmt3 = $conn->prepare("
    SELECT q.qid, q.qtext, COUNT(v.vid) AS cnt
    FROM question q
    LEFT JOIN vote v ON v.qid = q.qid
    GROUP BY q.qid, q.qtext
    ORDER BY q.qid DESC
    LIMIT 5
");
$stmt3->execute();
$res3 = $stmt3->get_result();
$allKerdesek = [];
while ($row = $res3->fetch_assoc()) {
    $allKerdesek[] = $row;
}
$stmt3->close();
$conn->close();

if ($allKerdesek) {
    $contextText .= "\nElérhető szavazások az oldalon:\n";
    foreach ($allKerdesek as $k) {
        $contextText .= "  - (#{$k['qid']}) \"{$k['qtext']}\" — {$k['cnt']} szavazat\n";
    }
}

// ── Bejelentkezett felhasználó neve (opcionális) ──
$username = isset($_SESSION['uname']) ? $_SESSION['uname'] : 'Vendég';

// ── Rendszer prompt összeállítása ──
$systemPrompt = <<<PROMPT
Te egy segítőkész AI asszisztens vagy, aki a "(Megették) A Termeszek" nevű középkori témájú szavazós weboldalon segít a felhasználóknak.
A weboldalon felhasználók különböző kérdésekre szavazhatnak, eredményeket tekinthetnek meg, és új kérdéseket adhatnak hozzá.

A felhasználó neve: $username

Aktuális szavazási adatok:
$contextText

Feladataid:
- Segíts a felhasználónak eligazodni az oldalon (szavazás, eredmények megtekintése, regisztráció stb.)
- Kommentálj az aktuális szavazás eredményeiről, ha érdeklődnek
- Válaszolj magyarul, röviden és barátságosan
- Ha nem tudod a választ, mondd meg őszintén
- Ne találj ki adatokat, csak a fenti valós adatokra támaszkodj
- Tartsd meg a középkori, lovagi hangulatot – de ne ess túlzásba
PROMPT;

// ── Conversation history összeállítása ──
$messages = [];
foreach ($conversation as $msg) {
    if (isset($msg['role'], $msg['content'])) {
        $role = $msg['role'] === 'user' ? 'user' : 'assistant';
        $messages[] = ['role' => $role, 'content' => (string)$msg['content']];
    }
}
$messages[] = ['role' => 'user', 'content' => $userMessage];

// ── Anthropic API hívás ──
$payload = json_encode([
    'model'      => 'claude-haiku-4-5-20251001',  // gyors és olcsó modell chatbothoz
    'max_tokens' => 512,
    'system'     => $systemPrompt,
    'messages'   => $messages,
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . $ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT        => 30,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(500);
    echo json_encode(['error' => 'Hálózati hiba: ' . $curlErr]);
    exit;
}

$data = json_decode($response, true);

if ($httpCode !== 200 || empty($data['content'][0]['text'])) {
    http_response_code(500);
    $errMsg = $data['error']['message'] ?? 'Ismeretlen API hiba.';
    echo json_encode(['error' => $errMsg]);
    exit;
}

echo json_encode([
    'reply'     => $data['content'][0]['text'],
    'inputTok'  => $data['usage']['input_tokens']  ?? 0,
    'outputTok' => $data['usage']['output_tokens'] ?? 0,
]);
