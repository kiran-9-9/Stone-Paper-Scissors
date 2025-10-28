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
        this.backendUrl = 'https://stone-paper-scissors-haea.onrender.com'; // Update with your Render backend URL
        this.jwtToken = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadGameData();
        this.updateStats();
        this.updateAuthUI();
        
        // Debug: Log initial state
        console.log('Game initialized. isLoggedIn:', this.isLoggedIn, 'playerName:', this.playerName);
    }
    updateAuthUI() {
        if (!this.loginBtn) return;
        if (this.isLoggedIn) {
            this.loginBtn.textContent = 'Logout';
        } else {
            this.loginBtn.textContent = 'Login';
        }
        if (this.usernameEl) this.usernameEl.textContent = this.playerName || 'Player';
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
        this.loginEmailInput = document.getElementById('loginEmail');
        this.passwordInput = document.getElementById('password');
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

        // Login/Logout
        this.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Login/Logout button clicked');
            console.log('Button text:', this.loginBtn.textContent.trim());
            console.log('isLoggedIn state:', this.isLoggedIn);
            
            // Use the actual isLoggedIn state instead of button text
            if (this.isLoggedIn) {
                console.log('Calling logout()');
                this.logout();
            } else {
                console.log('Calling showLoginModal()');
                this.showLoginModal();
            }
        });

        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        const signupBtn = document.getElementById('signupSubmit');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.signup();
            });
        }

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
        
        // Remove any animation classes
        this.playerChoiceEl.classList.remove('win-animation');
        this.computerChoiceEl.classList.remove('win-animation');
        
        // Reset game state
        this.isGameInProgress = false;
        
        // Save the reset state
        this.saveGameData();
        
        this.showNotification('Game reset!', 'info');
    }

    async saveScore() {
        console.log('Save score called. isLoggedIn:', this.isLoggedIn, 'playerName:', this.playerName);
        if (!this.isLoggedIn) {
            this.showLoginModal();
            this.showNotification('Please login to save your score!', 'info');
            return;
        }
        
        try {
            const scoreData = {
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
                    ...(this.jwtToken ? { 'Authorization': `Bearer ${this.jwtToken}` } : {})
                },
                body: JSON.stringify(scoreData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save score');
            }
            
            const data = await response.json();
            this.showNotification('Score saved successfully!', 'success');
            
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

    async login() {
        const email = this.loginEmailInput ? this.loginEmailInput.value.trim() : '';
        const playerName = document.getElementById('playerName').value.trim();
        const password = this.passwordInput ? this.passwordInput.value : '';
        if (!email || !playerName) {
            this.showNotification('Email and player name are required', 'error');
            return;
        }

        try {
            const resp = await fetch(`${this.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, playerName, password })
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.message || 'Login failed');
            }
            const data = await resp.json();
            this.jwtToken = data.token;
            this.playerName = data.player?.playerName || playerName;
            this.usernameEl.textContent = this.playerName;
            this.isLoggedIn = true;
            this.updateAuthUI();

            // Clear inputs
            if (this.loginEmailInput) this.loginEmailInput.value = '';
            document.getElementById('playerName').value = '';
            if (this.passwordInput) this.passwordInput.value = '';

            this.closeModal(this.loginModal);
            this.showNotification(`Welcome, ${this.playerName}!`, 'success');
            this.saveGameData();
        } catch (e) {
            console.error('Login error:', e);
            this.showNotification(e.message, 'error');
        }
    }

    async signup() {
        const email = this.loginEmailInput ? this.loginEmailInput.value.trim() : '';
        const playerName = document.getElementById('playerName').value.trim();
        const password = this.passwordInput ? this.passwordInput.value : '';
        if (!email || !playerName || !password || password.length < 6) {
            this.showNotification('Enter email, name, and 6+ char password', 'error');
            return;
        }

        try {
            const resp = await fetch(`${this.backendUrl}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, playerName, password })
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.message || 'Signup failed');
            }
            const data = await resp.json();
            this.jwtToken = data.token;
            this.playerName = data.player?.playerName || playerName;
            this.usernameEl.textContent = this.playerName;
            this.isLoggedIn = true;
            this.updateAuthUI();

            // Clear inputs
            if (this.loginEmailInput) this.loginEmailInput.value = '';
            document.getElementById('playerName').value = '';
            if (this.passwordInput) this.passwordInput.value = '';

            this.closeModal(this.loginModal);
            this.showNotification(`Welcome, ${this.playerName}!`, 'success');
            this.saveGameData();
        } catch (e) {
            console.error('Signup error:', e);
            this.showNotification(e.message, 'error');
        }
    }

    logout() {
        console.log('Logout called. Current state - isLoggedIn:', this.isLoggedIn);
        
        // Immediately set the state to prevent any further actions
        this.isLoggedIn = false;
        this.playerName = 'Player';
        this.usernameEl.textContent = 'Player';
        this.jwtToken = null;
        this.updateAuthUI();
        console.log('Button text updated to: Login');
        
        // Ensure any open modals are closed
        if (this.loginModal) this.closeModal(this.loginModal);
        
        // Persist logout immediately
        this.saveGameData();
        
        this.showNotification('Logged out successfully!', 'info');
        
        console.log('User logged out. New state - isLoggedIn:', this.isLoggedIn);
    }

    async loadLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 20px;">Loading leaderboard...</p>';
        
        try {
            const response = await fetch(`${this.backendUrl}/api/leaderboard`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load leaderboard');
            }
            
            const leaderboard = data.leaderboard || [];
            leaderboardList.innerHTML = '';
            
            if (leaderboard.length === 0) {
                leaderboardList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 20px;">No players found. Be the first to play and save your score!</p>';
                return;
            }
            
            // Add header row
            const header = document.createElement('div');
            header.className = 'leaderboard-header';
            header.innerHTML = `
                <span class="rank">#</span>
                <span class="name">Player</span>
                <span class="score">Best</span>
                <span class="wins">Wins</span>
                <span class="games">Games</span>
            `;
            leaderboardList.appendChild(header);
            
            leaderboard.forEach((player, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span class="rank">#${index + 1}</span>
                    <span class="name">${player.playerName || 'Unknown'}</span>
                    <span class="score">${player.bestScore || 0}</span>
                    <span class="wins">${player.totalWins || 0}W</span>
                    <span class="games">${player.totalGames || 0}G</span>
                `;
                leaderboardList.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            leaderboardList.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 20px;">Failed to load leaderboard. The backend server might be down.</p>';
        }
    }

    showLeaderboard() {
        this.loadLeaderboard();
        this.leaderboardModal.style.display = 'block';
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem('rpsGameData');
            console.log('Loading game data. Saved data exists:', !!savedData);
            
            if (savedData) {
                const data = JSON.parse(savedData);
                console.log('Loaded data:', data);
                
                this.userScore = data.userScore || 0;
                this.compScore = data.compScore || 0;
                this.totalGames = data.totalGames || 0;
                this.totalWins = data.totalWins || 0;
                this.currentStreak = data.currentStreak || 0;
                this.maxStreak = data.maxStreak || 0;
                this.gameHistory = data.gameHistory || [];
                this.playerName = data.playerName || 'Player';
                this.jwtToken = data.jwtToken || null;
                
                // If isLoggedIn is saved, use it; otherwise infer from username
                // If username is not 'Player', user was logged in
                this.isLoggedIn =
                    data.isLoggedIn !== undefined ? data.isLoggedIn :
                    (this.jwtToken ? true : (this.playerName !== 'Player' && this.playerName !== ''));
                
                console.log('Login state loaded:', this.isLoggedIn, 'Player:', this.playerName);
                
                this.userScoreEl.textContent = this.userScore;
                this.compScoreEl.textContent = this.compScore;
                this.usernameEl.textContent = this.playerName;
                
                // Update login button state
                if (this.loginBtn) {
                    this.updateAuthUI();
                } else {
                    console.warn('Login button not found!');
                }
            } else {
                console.log('No saved data found, using defaults');
            }
        } catch (error) {
            console.error('Error loading game data:', error);
            // Reset to defaults
            localStorage.removeItem('rpsGameData');
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
            playerName: this.playerName,
            isLoggedIn: this.isLoggedIn,
            jwtToken: this.jwtToken
        };
        
        console.log('Saving game data. Login state:', this.isLoggedIn, 'Player:', this.playerName);
        
        try {
            localStorage.setItem('rpsGameData', JSON.stringify(gameData));
            console.log('Game data saved successfully');
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Remove any existing notifications first
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Set colors based on type
        let bgColor = '#667eea'; // default info color
        if (type === 'success') bgColor = '#4ecdc4';
        else if (type === 'error') bgColor = '#ff6b6b';
        else if (type === 'info') bgColor = '#667eea';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
            font-weight: 500;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
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