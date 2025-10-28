<?php
require __DIR__ . '/config.php';

$data = read_json();
require_fields($data, ['email', 'password']);

$email = strtolower(trim($data['email']));
$password = $data['password'];
$playerName = isset($data['playerName']) ? trim($data['playerName']) : null;

try {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, player_name, password_hash FROM players WHERE email = ?');
    $stmt->execute([$email]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($password, $row['password_hash'])) {
        json_response([ 'success' => false, 'message' => 'Invalid credentials' ], 401);
    }

    // Optional name update
    if ($playerName && $playerName !== $row['player_name']) {
        $upd = $pdo->prepare('UPDATE players SET player_name = ?, updated_at = NOW() WHERE id = ?');
        $upd->execute([$playerName, (int)$row['id']]);
        $row['player_name'] = $playerName;
    }

    $_SESSION['player_id'] = (int)$row['id'];
    $_SESSION['player_name'] = $row['player_name'];
    $_SESSION['email'] = $email;

    json_response([ 'success' => true, 'player' => [ 'id' => (int)$row['id'], 'player_name' => $row['player_name'], 'email' => $email ] ]);
} catch (Throwable $e) {
    json_response([ 'success' => false, 'message' => 'Server error' ], 500);
}


