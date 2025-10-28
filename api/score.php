<?php
require __DIR__ . '/config.php';
require_auth();

$data = read_json();

$playerId = (int)$_SESSION['player_id'];
$score = isset($data['score']) ? (int)$data['score'] : 0;
$totalGames = isset($data['totalGames']) ? (int)$data['totalGames'] : 0;
$totalWins = isset($data['totalWins']) ? (int)$data['totalWins'] : 0;
$winRate = isset($data['winRate']) ? (float)$data['winRate'] : 0;
$currentStreak = isset($data['currentStreak']) ? (int)$data['currentStreak'] : 0;
$maxStreak = isset($data['maxStreak']) ? (int)$data['maxStreak'] : 0;
$history = isset($data['gameHistory']) ? json_encode($data['gameHistory']) : json_encode([]);

try {
    $pdo = db();
    // Update player aggregates
    $upd = $pdo->prepare('UPDATE players SET best_score = GREATEST(COALESCE(best_score,0), ?), total_wins = COALESCE(total_wins,0) + ?, total_games = COALESCE(total_games,0) + ?, current_streak = ?, max_streak = GREATEST(COALESCE(max_streak,0), ?), last_played = NOW(), updated_at = NOW() WHERE id = ?');
    $upd->execute([$score, $totalWins, $totalGames, $currentStreak, $maxStreak, $playerId]);

    // Insert session
    $ins = $pdo->prepare('INSERT INTO game_sessions (player_id, score, total_games, total_wins, win_rate, current_streak, max_streak, history, ended_at, created_at) VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())');
    $ins->execute([$playerId, $score, $totalGames, $totalWins, $winRate, $currentStreak, $maxStreak, $history]);

    json_response([ 'success' => true ]);
} catch (Throwable $e) {
    json_response([ 'success' => false, 'message' => 'Server error' ], 500);
}


