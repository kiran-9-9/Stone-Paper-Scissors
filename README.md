# 🪨📄✂️ Enhanced Rock Paper Scissors Game

A modern, responsive Rock Paper Scissors game with backend integration, user tracking, leaderboards, and smooth animations. Built with vanilla JavaScript, Node.js, Express, and MongoDB. Deployed on Netlify (frontend) and Render (backend).

## ✨ Features

### Frontend Features
- 🎨 **Modern UI Design** - Beautiful gradient backgrounds and glassmorphism effects
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- 🎭 **Smooth Animations** - Engaging transitions and hover effects
- ⌨️ **Keyboard Support** - Play with R, P, S keys and spacebar for reset
- 📊 **Real-time Stats** - Win rate, streak tracking, and game history
- 🏆 **Leaderboard** - Global ranking system
- 💾 **Local Storage** - Game progress saved locally
- 🎯 **Touch Support** - Optimized for mobile devices

### Backend Features
- 👤 **User Tracking** - Player statistics and game history
- 🏆 **Leaderboard System** - Global rankings and player stats
- 📈 **Analytics** - Game statistics and player insights
- 🔒 **Rate Limiting** - API protection
- 📊 **MongoDB Integration** - Persistent data storage
- 🛡️ **Security** - CORS, Helmet, and input validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for backend)
- MongoDB Atlas account (for database)
- Netlify account (for frontend deployment)
- Render account (for backend deployment)

### Local Development

**Note:** This project is configured for production deployment. For local development, you'll need to set up environment variables.

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SPS
   ```

2. **Frontend Setup**
   ```bash
   cd FRONTEND
   # Open index.html in your browser or use a local server
   python -m http.server 8000
   # Or use any static file server
   ```

3. **Backend Setup**
   ```bash
   cd BACKEND
   npm install
   cp env.example .env
   # Edit .env with your MongoDB URI
   npm start
   ```

## 🌐 Deployment Guide

### Frontend Deployment (Netlify)

1. **Prepare for Deployment**
   - Update the backend URL in `FRONTEND/sps.js`:
   ```javascript
   this.backendUrl = 'https://your-backend-url.onrender.com';
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build settings:
     - Build command: `echo 'No build process needed'`
     - Publish directory: `FRONTEND`
   - Deploy!

3. **Configure Environment Variables**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add any required environment variables

### Backend Deployment (Render)

1. **Prepare for Deployment**
   - Create a MongoDB Atlas cluster
   - Update `BACKEND/render.yaml` with your settings
   - Update the frontend URL in your backend code

2. **Deploy to Render**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Configure:
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment: Node
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `FRONTEND_URL`: Your Netlify frontend URL
     - `NODE_ENV`: production

3. **Database Setup**
   - Create a MongoDB Atlas cluster
   - Get the connection string
   - Add it to your Render environment variables

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rps-game
FRONTEND_URL=https://your-app-name.netlify.app
```

**Frontend (Update in sps.js)**
```javascript
this.backendUrl = 'https://your-backend-url.onrender.com';
```

### MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for Render)
5. Get the connection string
6. Update your environment variables

## 📱 Mobile Optimization

The game is fully optimized for mobile devices with:
- Touch-friendly interface
- Responsive design
- Gesture support
- Optimized animations
- Mobile-first CSS

## 🎮 Game Controls

- **Mouse/Touch**: Click on Rock, Paper, or Scissors
- **Keyboard**: 
  - `R` for Rock
  - `P` for Paper
  - `S` for Scissors
  - `Spacebar` for Reset

## 🏗️ Architecture

```
SPS/
├── FRONTEND/                 # Frontend application
│   ├── index.html           # Main HTML file
│   ├── sps.css             # Enhanced CSS with animations
│   ├── sps.js              # Game logic and API integration
│   ├── netlify.toml        # Netlify configuration
│   └── *.png               # Game assets
├── BACKEND/                 # Backend API
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   ├── render.yaml         # Render configuration
│   └── env.example         # Environment variables template
└── README.md               # This file
```

## 🔌 API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/scores` - Save player score
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/player/:id` - Get player stats
- `GET /api/stats` - Get global statistics

## 🎨 Customization

### Colors and Themes
Edit `FRONTEND/sps.css` to customize:
- Gradient backgrounds
- Button styles
- Animation effects
- Color schemes

### Game Rules
Modify `FRONTEND/sps.js` to:
- Add new game modes
- Change scoring system
- Add power-ups or special moves

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend URL is correct in frontend
   - Check CORS configuration in backend

2. **Database Connection**
   - Verify MongoDB URI
   - Check network access in MongoDB Atlas

3. **Deployment Issues**
   - Check environment variables
   - Verify build commands
   - Check logs in deployment platform

## 📈 Performance Optimization

- **Frontend**: Optimized CSS animations, lazy loading
- **Backend**: Rate limiting, compression, caching
- **Database**: Indexed queries, connection pooling

## 🔒 Security Features

- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- MongoDB injection prevention

## 📊 Analytics

The backend tracks:
- Player statistics
- Game sessions
- Win rates
- Streak records
- Global leaderboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the deployment logs
3. Verify environment variables
4. Test locally first

## 🎯 Future Enhancements

- [ ] Multiplayer support
- [ ] Tournament mode
- [ ] Achievement system
- [ ] Social features
- [ ] Advanced analytics
- [ ] Mobile app version

---

**Happy Gaming! 🎮**
