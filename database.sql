-- MySQL schema for Hostinger
CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  player_name VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  best_score INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_games INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  last_played DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  score INT DEFAULT 0,
  total_games INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  history JSON NULL,
  ended_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_player (player_id),
  CONSTRAINT fk_session_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);


