<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Ellenőrizzük, van-e bejelentkezett felhasználó
if (isset($_SESSION['user']) && !empty($_SESSION['user']['name'])) {
    echo json_encode([
        "loggedIn" => true,
        "name" => $_SESSION['user']['name']
    ]);
} else {
    echo json_encode([
        "loggedIn" => false,
        "name" => null
    ]);
}
