// Enhanced Rock Paper Scissors Game with Backend Integration
class RockPaperScissorsGame {
    constructor() {
        this.userScore = 0;
        this.compScore = 0;
        this.totalGames = 0;
        this.totalWins = 0;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.playerName = 'Player';
        this.isLoggedIn = false;
        this.gameHistory = [];
        this.backendUrl = 'https://your-render-app.onrender.com'; // Update this with your actual Render URL
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadGameData();
        this.updateStats();
    }

    initializeElements() {
        // Game elements
        this.choices = document.querySelectorAll('.choice');
        this.gameMessage = document.getElementById('gameMessage');
        this.userScoreEl = document.getElementById('userScore');
        this.compScoreEl = document.getElementById('compScore');
        this.playerChoiceEl = document.getElementById('playerChoice');
        this.computerChoiceEl = document.getElementById('computerChoice');
        
        // Stats elements
        this.totalWinsEl = document.getElementById('totalWins');
        this.winRateEl = document.getElementById('winRate');
        this.streakEl = document.getElementById('streak');
        
        // User elements
        this.usernameEl = document.getElementById('username');
        this.loginBtn = document.getElementById('loginBtn');
        
        // Buttons
        this.resetBtn = document.getElementById('reset');
        this.saveScoreBtn = document.getElementById('saveScore');
        
        // Modals
        this.loginModal = document.getElementById('loginModal');
        this.leaderboardModal = document.getElementById('leaderboardModal');
        this.loginForm = document.getElementById('loginForm');
    }

    attachEventListeners() {
        // Choice selection
        this.choices.forEach(choice => {
            choice.addEventListener('click', () => {
                if (this.isGameInProgress) return;
                this.playGame(choice.dataset.choice);
            });
        });

        // Reset game
        this.resetBtn.addEventListener('click', () => {
            this.resetGame();
        });

        // Save score
        this.saveScoreBtn.addEventListener('click', () => {
            this.saveScore();
        });

        // Login
        this.loginBtn.addEventListener('click', () => {
            this.showLoginModal();
        });

        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Modal close events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    async playGame(userChoice) {
        this.isGameInProgress = true;
        this.totalGames++;
        
        // Show loading animation
        this.showLoadingAnimation();
        
        // Generate computer choice
        const compChoice = this.generateComputerChoice();
        
        // Update battle area with animations
        this.updateBattleArea(userChoice, compChoice);
        
        // Wait for animation
        await this.delay(1000);
        
        // Determine winner
        const result = this.determineWinner(userChoice, compChoice);
        
        // Update scores and stats
        this.updateScores(result);
        this.updateGameMessage(result, userChoice, compChoice);
        this.updateStats();
        
        // Add to game history
        this.addToHistory(userChoice, compChoice, result);
        
        // Show result animation
        this.showResultAnimation(result);
        
        this.isGameInProgress = false;
    }

    generateComputerChoice() {
        const options = ['rock', 'paper', 'scissors'];
        const randomIndex = Math.floor(Math.random() * 3);
        return options[randomIndex];
    }

    updateBattleArea(userChoice, compChoice) {
        // Update player choice
        this.playerChoiceEl.innerHTML = this.getChoiceIcon(userChoice);
        this.playerChoiceEl.classList.add('win-animation');
        
        // Update computer choice with delay
        setTimeout(() => {
            this.computerChoiceEl.innerHTML = this.getChoiceIcon(compChoice);
            this.computerChoiceEl.classList.add('win-animation');
        }, 500);
    }

    getChoiceIcon(choice) {
        const icons = {
            rock: '<i class="fas fa-hand-rock"></i>',
            paper: '<i class="fas fa-hand-paper"></i>',
            scissors: '<i class="fas fa-hand-scissors"></i>'
        };
        return icons[choice];
    }

    determineWinner(userChoice, compChoice) {
        if (userChoice === compChoice) {
            return 'draw';
        }
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        
        return winConditions[userChoice] === compChoice ? 'win' : 'lose';
    }

    updateScores(result) {
        if (result === 'win') {
            this.userScore++;
            this.totalWins++;
            this.currentStreak++;
            this.maxStreak = Math.max(this.maxStreak, this.currentStreak);
        } else if (result === 'lose') {
            this.compScore++;
            this.currentStreak = 0;
        }
        
        this.userScoreEl.textContent = this.userScore;
        this.compScoreEl.textContent = this.compScore;
    }

    updateGameMessage(result, userChoice, compChoice) {
        const messages = {
            win: `🎉 You Win! ${this.capitalizeFirst(userChoice)} beats ${this.capitalizeFirst(compChoice)}`,
            lose: `😔 You Lose! ${this.capitalizeFirst(compChoice)} beats ${this.capitalizeFirst(userChoice)}`,
            draw: `🤝 It's a Draw! Both chose ${this.capitalizeFirst(userChoice)}`
        };
        
        this.gameMessage.textContent = messages[result];
        this.gameMessage.className = `msg ${result === 'win' ? 'success' : result === 'lose' ? 'error' : ''}`;
    }

    showResultAnimation(result) {
        if (result === 'win') {
            this.playerChoiceEl.classList.add('win-animation');
        } else if (result === 'lose') {
            this.computerChoiceEl.classList.add('win-animation');
        }
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            this.playerChoiceEl.classList.remove('win-animation');
            this.computerChoiceEl.classList.remove('win-animation');
        }, 600);
    }

    showLoadingAnimation() {
        this.playerChoiceEl.innerHTML = '<div class="loading"></div>';
        this.computerChoiceEl.innerHTML = '<div class="loading"></div>';
    }

    updateStats() {
        this.totalWinsEl.textContent = this.totalWins;
        this.winRateEl.textContent = this.totalGames > 0 ? Math.round((this.totalWins / this.totalGames) * 100) : 0;
        this.streakEl.textContent = this.currentStreak;
    }

    addToHistory(userChoice, compChoice, result) {
        this.gameHistory.push({
            userChoice,
            compChoice,
            result,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 games
        if (this.gameHistory.length > 50) {
            this.gameHistory.shift();
        }
    }

    resetGame() {
        this.userScore = 0;
        this.compScore = 0;
        this.userScoreEl.textContent = '0';
        this.compScoreEl.textContent = '0';
        this.gameMessage.textContent = 'Make your move!';
        this.gameMessage.className = 'msg';
        
        // Reset battle area
        this.playerChoiceEl.innerHTML = '<i class="fas fa-question"></i>';
        this.computerChoiceEl.innerHTML = '<i class="fas fa-question"></i>';
        
        // Reset stats
        this.updateStats();
    }

    async saveScore() {
        if (!this.isLoggedIn) {
            this.showLoginModal();
            return;
        }
        
        try {
            const scoreData = {
                playerName: this.playerName,
                score: this.userScore,
                totalGames: this.totalGames,
                totalWins: this.totalWins,
                winRate: this.totalGames > 0 ? (this.totalWins / this.totalGames) * 100 : 0,
                currentStreak: this.currentStreak,
                maxStreak: this.maxStreak,
                gameHistory: this.gameHistory
            };
            
            const response = await fetch(`${this.backendUrl}/api/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData)
            });
            
            if (response.ok) {
                this.showNotification('Score saved successfully!', 'success');
            } else {
                throw new Error('Failed to save score');
            }
        } catch (error) {
            console.error('Error saving score:', error);
            this.showNotification('Failed to save score. Please try again.', 'error');
        }
    }

    showLoginModal() {
        this.loginModal.style.display = 'block';
    }

    closeModal(modal) {
        modal.style.display = 'none';
    }

    login() {
        const playerName = document.getElementById('playerName').value.trim();
        if (playerName) {
            this.playerName = playerName;
            this.usernameEl.textContent = playerName;
            this.isLoggedIn = true;
            this.loginBtn.textContent = 'Logout';
            this.closeModal(this.loginModal);
            this.showNotification(`Welcome, ${playerName}!`, 'success');
        }
    }

    async loadLeaderboard() {
        try {
            const response = await fetch(`${this.backendUrl}/api/leaderboard`);
            const leaderboard = await response.json();
            
            const leaderboardList = document.getElementById('leaderboardList');
            leaderboardList.innerHTML = '';
            
            leaderboard.forEach((player, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span class="rank">#${index + 1}</span>
                    <span class="name">${player.playerName}</span>
                    <span class="score">${player.score}</span>
                `;
                leaderboardList.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            document.getElementById('leaderboardList').innerHTML = '<p>Failed to load leaderboard</p>';
        }
    }

    showLeaderboard() {
        this.loadLeaderboard();
        this.leaderboardModal.style.display = 'block';
    }

    loadGameData() {
        const savedData = localStorage.getItem('rpsGameData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.userScore = data.userScore || 0;
            this.compScore = data.compScore || 0;
            this.totalGames = data.totalGames || 0;
            this.totalWins = data.totalWins || 0;
            this.currentStreak = data.currentStreak || 0;
            this.maxStreak = data.maxStreak || 0;
            this.gameHistory = data.gameHistory || [];
            this.playerName = data.playerName || 'Player';
            
            this.userScoreEl.textContent = this.userScore;
            this.compScoreEl.textContent = this.compScore;
            this.usernameEl.textContent = this.playerName;
        }
    }

    saveGameData() {
        const gameData = {
            userScore: this.userScore,
            compScore: this.compScore,
            totalGames: this.totalGames,
            totalWins: this.totalWins,
            currentStreak: this.currentStreak,
            maxStreak: this.maxStreak,
            gameHistory: this.gameHistory,
            playerName: this.playerName
        };
        
        localStorage.setItem('rpsGameData', JSON.stringify(gameData));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#667eea'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new RockPaperScissorsGame();
    
    // Save game data periodically
    setInterval(() => {
        game.saveGameData();
    }, 5000);
    
    // Add leaderboard button functionality
    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.className = 'btn btn-secondary';
    leaderboardBtn.innerHTML = '<i class="fas fa-trophy"></i> Leaderboard';
    leaderboardBtn.addEventListener('click', () => game.showLeaderboard());
    
    const actionButtons = document.querySelector('.action-buttons');
    actionButtons.appendChild(leaderboardBtn);
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        document.getElementById('rock').click();
    } else if (e.key === 'p' || e.key === 'P') {
        document.getElementById('paper').click();
    } else if (e.key === 's' || e.key === 'S') {
        document.getElementById('scissors').click();
    } else if (e.key === ' ') {
        e.preventDefault();
        document.getElementById('reset').click();
    }
});

// Add touch support for mobile
document.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('choice')) {
        e.target.style.transform = 'scale(0.95)';
    }
});

document.addEventListener('touchend', (e) => {
    if (e.target.classList.contains('choice')) {
        e.target.style.transform = '';
    }
});