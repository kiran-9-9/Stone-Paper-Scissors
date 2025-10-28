<?php
// Configuration and DB connection for Hostinger MySQL
// Fill these from hPanel → Databases

$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'sps';
$DB_USER = getenv('DB_USER') ?: 'user';
$DB_PASS = getenv('DB_PASS') ?: 'password';

// Start PHP session for auth
if (session_status() === PHP_SESSION_NONE) {
    // 1 day cookie lifetime
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    ]);
    session_start();
}

function db() {
    static $pdo = null;
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    if ($pdo === null) {
        $dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    }
    return $pdo;
}

function read_json() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function json_response($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function require_fields($data, $fields) {
    foreach ($fields as $f) {
        if (!isset($data[$f]) || $data[$f] === '') {
            json_response([ 'success' => false, 'message' => "Missing field: {$f}" ], 400);
        }
    }
}

function require_auth() {
    if (!isset($_SESSION['player_id'])) {
        json_response([ 'success' => false, 'message' => 'Not authenticated' ], 401);
    }
}


