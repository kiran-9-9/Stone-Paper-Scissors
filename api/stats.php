<?php
require __DIR__ . '/config.php';

try {
    $pdo = db();
    $totalPlayers = (int)$pdo->query('SELECT COUNT(*) FROM players')->fetchColumn();
    $totalGames = (int)$pdo->query('SELECT COALESCE(SUM(total_games),0) FROM players')->fetchColumn();
    $totalWins = (int)$pdo->query('SELECT COALESCE(SUM(total_wins),0) FROM players')->fetchColumn();
    $top = $pdo->query('SELECT player_name, best_score FROM players ORDER BY best_score DESC LIMIT 1')->fetch();
    $recent = $pdo->query('SELECT player_name, last_played FROM players ORDER BY last_played DESC LIMIT 5')->fetchAll();

    json_response([
        'success' => true,
        'stats' => [
            'totalPlayers' => $totalPlayers,
            'totalGames' => $totalGames,
            'totalWins' => $totalWins,
            'topPlayer' => $top,
            'recentPlayers' => $recent,
        ]
    ]);
} catch (Throwable $e) {
    json_response([ 'success' => false, 'message' => 'Server error' ], 500);
}


