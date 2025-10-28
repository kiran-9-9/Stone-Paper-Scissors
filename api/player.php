<?php
require __DIR__ . '/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$name = isset($_GET['name']) ? trim($_GET['name']) : null;

if (!$id && !$name) {
    json_response([ 'success' => false, 'message' => 'Provide id or name' ], 400);
}

try {
    $pdo = db();
    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM players WHERE id = ?');
        $stmt->execute([$id]);
    } else {
        $stmt = $pdo->prepare('SELECT * FROM players WHERE player_name = ?');
        $stmt->execute([$name]);
    }
    $row = $stmt->fetch();
    if (!$row) json_response([ 'success' => false, 'message' => 'Player not found' ], 404);
    json_response([ 'success' => true, 'player' => $row ]);
} catch (Throwable $e) {
    json_response([ 'success' => false, 'message' => 'Server error' ], 500);
}


