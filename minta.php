<?php
session_start();
require __DIR__ . '/db.php'; // gyĂ¶kĂ©rben lĂ©vĹ‘ db.php

$qid = 1; // alapĂ©rtelmezett
$latest = $conn->query("SELECT qid FROM question ORDER BY qid DESC LIMIT 1");
if ($latest && $latest->num_rows > 0) {
  $qid = $latest->fetch_assoc()['qid'];
}
?>
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <title>SzavazĂˇs kezdĹ‘lap</title>
  <style>
    .notice {
      font-size: 1.2em;
      color: #b00;
      margin-left: 10px;
    }
    nav {
      background:#eee;
      padding:10px;
      margin-bottom:20px;
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div id="userbox">
    <?php if (!isset($_SESSION['uid'])): ?>
      <!-- VendĂ©g felhasznĂˇlĂł -->
      <a href="login.html">BejelentkezĂ©s</a>
    <?php else: ?>
      <!-- Bejelentkezett felhasznĂˇlĂł -->
      Bejelentkezve: <strong><?= htmlspecialchars($_SESSION['name']) ?></strong>
      <form action="api/logout.php" method="post" style="display:inline;">
        <button type="submit">KijelentkezĂ©s</button>
      </form>
    <?php endif; ?>
  </div>

  <nav>
    <a href="index.php">KezdĹ‘lap</a>
    <?php if (isset($_SESSION['uid'])): ?>
      | <a href="poll.html?qid=<?= $qid ?>">SzavazĂˇs</a>
      | <a href="result.html?qid=<?= $qid ?>">EredmĂ©nyek</a>
      | <a href="admin.html">Ăšj kĂ©rdĂ©s</a>
      | <a href="dashboard.html">KĂ©rdĂ©skezelĂ©s</a>
    <?php endif; ?>
  </nav>

  <h1>ElĂ©rhetĹ‘ kĂ©rdĂ©sek</h1>
  <ul>
    <?php
    $res = $conn->query("SELECT qid, qtext FROM question ORDER BY qid ASC");
    if ($res && $res->num_rows > 0) {
      while ($row = $res->fetch_assoc()) {
        echo "<li>";
        echo htmlspecialchars($row['qtext']);
        if (isset($_SESSION['uid'])) {
          echo " <a href=\"poll.html?qid={$row['qid']}\">[SzavazĂˇs]</a>";
          echo " <a href=\"result.html?qid={$row['qid']}\">[EredmĂ©nyek]</a>";
        } else {
          echo " <span class=\"notice\">(BejelentkezĂ©s szĂĽksĂ©ges)</span>";
        }
        echo "</li>";
      }
    } else {
      echo "<li>Nincs elĂ©rhetĹ‘ kĂ©rdĂ©s</li>";
    }
    $conn->close();
    ?>
  </ul>
</body>
</html>