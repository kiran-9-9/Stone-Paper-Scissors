<?php
require __DIR__ . '/config.php';

$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;

try {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT player_name, best_score, total_wins, total_games FROM players ORDER BY best_score DESC LIMIT ?');
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
    json_response([ 'success' => true, 'leaderboard' => $rows ]);
} catch (Throwable $e) {
    json_response([ 'success' => false, 'message' => 'Server error' ], 500);
}


