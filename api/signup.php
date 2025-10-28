<?php
require __DIR__ . '/config.php';

$data = read_json();
require_fields($data, ['email', 'playerName', 'password']);

$email = strtolower(trim($data['email']));
$playerName = trim($data['playerName']);
$password = $data['password'];

try {
    $pdo = db();
    // Check exists
    $stmt = $pdo->prepare('SELECT id FROM players WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_response([ 'success' => false, 'message' => 'Email already registered' ], 409);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO players (email, player_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())');
    $stmt->execute([$email, $playerName, $hash]);
    $playerId = (int)$pdo->lastInsertId();

    $_SESSION['player_id'] = $playerId;
    $_SESSION['player_name'] = $playerName;
    $_SESSION['email'] = $email;

    json_response([ 'success' => true, 'player' => [ 'id' => $playerId, 'player_name' => $playerName, 'email' => $email ] ]);
} catch (Throwable $e) {
    json_response([ 'success' => false, 'message' => 'Server error' ], 500);
}


