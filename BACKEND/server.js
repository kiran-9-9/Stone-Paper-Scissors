const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MongoDB connection string not provided. Please set MONGODB_URI in your environment variables.');
        }
        
        const connectOptions = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        
        await mongoose.connect(mongoURI, connectOptions);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('Please check your MONGODB_URI environment variable.');
        // Don't exit in production - let the app start even if DB is temporarily unavailable
        if (process.env.NODE_ENV === 'production') {
            console.log('⚠️ Continuing without database connection...');
        } else {
            process.exit(1);
        }
    }
};

// Models
const PlayerSchema = new mongoose.Schema({
    playerName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String },
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

// Indexes
PlayerSchema.index({ email: 1 }, { unique: true, sparse: true });
PlayerSchema.index({ playerName: 1 });

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

// Auth helpers
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) return res.status(401).json({ success: false, message: 'Missing Authorization token' });
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // { playerId, email, playerName }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

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

// DB health
app.get('/health/db', (req, res) => {
    const conn = mongoose.connection;
    res.json({
        status: 'OK',
        readyState: conn.readyState, // 1 means connected
        host: conn.host,
        name: conn.name
    });
});

// Auth: login or register
app.post('/api/auth/login', [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('playerName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Player name must be 2-50 chars'),
    body('password').optional().isString().isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, playerName, password } = req.body;

        let player = await Player.findOne({ email });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Account not found. Please sign up.' });
        }

        // If account has a password, verify it
        if (player.passwordHash) {
            if (!password) return res.status(400).json({ success: false, message: 'Password required' });
            const ok = await bcrypt.compare(password, player.passwordHash);
            if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        } else {
            // No password set yet; allow name update
            if (playerName && player.playerName !== playerName) {
                player.playerName = playerName;
                player.updatedAt = new Date();
                await player.save();
            }
        }

        const token = jwt.sign({ playerId: player._id.toString(), email: player.email, playerName: player.playerName }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            player: {
                id: player._id,
                email: player.email,
                playerName: player.playerName,
                bestScore: player.bestScore,
                totalWins: player.totalWins,
                totalGames: player.totalGames
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Auth: signup
app.post('/api/auth/signup', [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('playerName').trim().isLength({ min: 2, max: 50 }).withMessage('Player name must be 2-50 chars'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, playerName, password } = req.body;

        let existing = await Player.findOne({ email });
        if (existing && existing.passwordHash) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        let player;
        if (existing) {
            // Upgrade existing email-only record with password and name
            existing.playerName = playerName;
            existing.passwordHash = passwordHash;
            existing.updatedAt = new Date();
            await existing.save();
            player = existing;
        } else {
            player = new Player({ email, playerName, passwordHash });
            await player.save();
        }

        const token = jwt.sign({ playerId: player._id.toString(), email: player.email, playerName: player.playerName }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, token, player: { id: player._id, email: player.email, playerName: player.playerName } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Save score endpoint
app.post('/api/scores', authMiddleware, validateScoreData, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { score, totalGames, totalWins, winRate, currentStreak, maxStreak, gameHistory } = req.body;

        // Identify player from JWT
        const { playerId, email } = req.user || {};

        // Find or create player
        let player = null;
        if (playerId) {
            player = await Player.findById(playerId);
        }
        if (!player && email) {
            player = await Player.findOne({ email });
        }
        if (!player) {
            return res.status(401).json({ success: false, message: 'Player not found for token' });
        }
        {
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
