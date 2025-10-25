const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rps-game';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Models
const PlayerSchema = new mongoose.Schema({
    playerName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, trim: true, lowercase: true },
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    gameHistory: [{
        userChoice: String,
        compChoice: String,
        result: String,
        timestamp: Date
    }],
    lastPlayed: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const GameSessionSchema = new mongoose.Schema({
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    sessionId: String,
    score: Number,
    totalGames: Number,
    totalWins: Number,
    winRate: Number,
    currentStreak: Number,
    maxStreak: Number,
    gameHistory: [{
        userChoice: String,
        compChoice: String,
        result: String,
        timestamp: Date
    }],
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    duration: Number // in minutes
});

const Player = mongoose.model('Player', PlayerSchema);
const GameSession = mongoose.model('GameSession', GameSessionSchema);

// Validation middleware
const validateScoreData = [
    body('playerName').trim().isLength({ min: 1, max: 50 }).withMessage('Player name must be between 1 and 50 characters'),
    body('score').isNumeric().withMessage('Score must be a number'),
    body('totalGames').isNumeric().withMessage('Total games must be a number'),
    body('totalWins').isNumeric().withMessage('Total wins must be a number'),
    body('winRate').isNumeric().withMessage('Win rate must be a number'),
    body('currentStreak').isNumeric().withMessage('Current streak must be a number'),
    body('maxStreak').isNumeric().withMessage('Max streak must be a number')
];

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Rock Paper Scissors API',
        version: '1.0.0',
        endpoints: {
            'POST /api/scores': 'Save player score',
            'GET /api/leaderboard': 'Get leaderboard',
            'GET /api/player/:id': 'Get player stats',
            'GET /api/stats': 'Get global stats'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Save score endpoint
app.post('/api/scores', validateScoreData, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { playerName, score, totalGames, totalWins, winRate, currentStreak, maxStreak, gameHistory } = req.body;

        // Find or create player
        let player = await Player.findOne({ playerName });
        if (!player) {
            player = new Player({
                playerName,
                totalGames,
                totalWins,
                currentStreak,
                maxStreak,
                bestScore: score,
                gameHistory: gameHistory || []
            });
        } else {
            // Update player stats
            player.totalGames += totalGames;
            player.totalWins += totalWins;
            player.currentStreak = currentStreak;
            player.maxStreak = Math.max(player.maxStreak, maxStreak);
            player.bestScore = Math.max(player.bestScore, score);
            player.gameHistory = [...(player.gameHistory || []), ...(gameHistory || [])];
            player.lastPlayed = new Date();
            player.updatedAt = new Date();
        }

        await player.save();

        // Create game session
        const gameSession = new GameSession({
            playerId: player._id,
            sessionId: req.sessionID || 'anonymous',
            score,
            totalGames,
            totalWins,
            winRate,
            currentStreak,
            maxStreak,
            gameHistory: gameHistory || [],
            endedAt: new Date(),
            duration: 0 // Calculate if needed
        });

        await gameSession.save();

        res.json({
            success: true,
            message: 'Score saved successfully',
            playerId: player._id,
            sessionId: gameSession._id
        });

    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'bestScore';

        const leaderboard = await Player.find()
            .sort({ [sortBy]: -1 })
            .limit(limit)
            .select('playerName bestScore totalWins totalGames currentStreak maxStreak lastPlayed')
            .lean();

        // Calculate win rates
        const leaderboardWithWinRate = leaderboard.map(player => ({
            ...player,
            winRate: player.totalGames > 0 ? Math.round((player.totalWins / player.totalGames) * 100) : 0
        }));

        res.json({
            success: true,
            leaderboard: leaderboardWithWinRate,
            totalPlayers: await Player.countDocuments()
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get player stats
app.get('/api/player/:id', async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({
                success: false,
                message: 'Player not found'
            });
        }

        const winRate = player.totalGames > 0 ? Math.round((player.totalWins / player.totalGames) * 100) : 0;

        res.json({
            success: true,
            player: {
                ...player.toObject(),
                winRate
            }
        });

    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get global stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalPlayers = await Player.countDocuments();
        const totalGames = await Player.aggregate([
            { $group: { _id: null, total: { $sum: '$totalGames' } } }
        ]);
        const totalWins = await Player.aggregate([
            { $group: { _id: null, total: { $sum: '$totalWins' } } }
        ]);

        const topPlayer = await Player.findOne()
            .sort({ bestScore: -1 })
            .select('playerName bestScore')
            .lean();

        const recentPlayers = await Player.find()
            .sort({ lastPlayed: -1 })
            .limit(5)
            .select('playerName lastPlayed')
            .lean();

        res.json({
            success: true,
            stats: {
                totalPlayers,
                totalGames: totalGames[0]?.total || 0,
                totalWins: totalWins[0]?.total || 0,
                topPlayer,
                recentPlayers
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get player by name
app.get('/api/player/name/:name', async (req, res) => {
    try {
        const player = await Player.findOne({ playerName: req.params.name });
        if (!player) {
            return res.status(404).json({
                success: false,
                message: 'Player not found'
            });
        }

        const winRate = player.totalGames > 0 ? Math.round((player.totalWins / player.totalGames) * 100) : 0;

        res.json({
            success: true,
            player: {
                ...player.toObject(),
                winRate
            }
        });

    } catch (error) {
        console.error('Error fetching player by name:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// 404 handling
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
