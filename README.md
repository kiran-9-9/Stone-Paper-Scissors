## Hostinger PHP + MySQL Setup

1. Create MySQL database in Hostinger hPanel and note DB name, user, password, host.
2. Upload `FRONTEND/` files to `public_html/`.
3. Create an `api/` folder in `public_html/` and upload PHP endpoints (signup.php, login.php, score.php, leaderboard.php, player.php, stats.php, config.php).
4. In `config.php`, set the Hostinger DB credentials. Import `database.sql` (phpMyAdmin → Import) to create tables.
5. In `FRONTEND/sps.js`, ensure `this.backendUrl = '/api'`.
6. Test: open your site → Signup → Login → Save Score.

# 🪨📄✂️ Enhanced Rock Paper Scissors Game

A modern, responsive Rock Paper Scissors game with backend integration, user tracking, leaderboards, and smooth animations. Frontend is vanilla JavaScript. Backend is PHP with MySQL.

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

### Backend Features (PHP/MySQL)
- 👤 **User Tracking** - Player statistics and game history
- 🏆 **Leaderboard System** - Global rankings and player stats
- 📈 **Analytics** - Game statistics and player insights

## 🚀 Quick Start (Local)

1. Start a local PHP server in the project root or `public_html` equivalent, serving `FRONTEND/` as web root and exposing `api/` under `/api`.
   - Example (PHP built-in):
     - Serve frontend: `php -S localhost:8000 -t FRONTEND`
     - Ensure the `api/` folder is accessible at `http://localhost:8000/../api` or serve both via your local web server (XAMPP/WAMP).
2. Create a MySQL database and import `database.sql`.
3. Update `api/config.php` with your DB credentials (or set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` env vars).
4. Ensure `FRONTEND/sps.js` has `this.backendUrl = '/api'`.
5. Open `FRONTEND/index.html` in a browser, then Signup → Login → Save Score.

## 🌐 Deployment Guide (Hostinger)

1. Create a MySQL database in hPanel and note credentials.
2. Upload `FRONTEND/` contents to `public_html/`.
3. Create `public_html/api/` and upload: `config.php`, `login.php`, `signup.php`, `logout.php`, `score.php`, `leaderboard.php`, `player.php`, `stats.php`.
4. Edit `api/config.php` with DB credentials or set env vars in hosting.
5. Import `database.sql` via phpMyAdmin.
6. Ensure `FRONTEND/sps.js` uses `this.backendUrl = '/api'`.

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

## 🏗️ Structure

```
SPS/
├── FRONTEND/                 # Frontend application
│   ├── index.html           # Main HTML file
│   ├── sps.css             # Styles
│   └── sps.js              # Game logic and API integration
├── api/                      # PHP API (served under /api)
│   ├── config.php
│   ├── login.php
│   ├── signup.php
│   ├── logout.php
│   ├── score.php
│   ├── leaderboard.php
│   ├── player.php
│   └── stats.php
└── database.sql              # MySQL schema
```

## 🔌 API Endpoints

- `POST /api/signup.php` - Signup
- `POST /api/login.php` - Login
- `POST /api/logout.php` - Logout
- `POST /api/score.php` - Save player score
- `GET /api/leaderboard.php?limit=10` - Get leaderboard
- `GET /api/player.php?id=123` or `?name=Alice` - Get player
- `GET /api/stats.php` - Get global statistics

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
   - Verify `config.php` DB credentials
   - Ensure tables exist via `database.sql`

3. **Deployment Issues**
   - Check environment variables
   - Verify build commands
   - Check logs in deployment platform

## 📈 Performance Optimization

- **Frontend**: Optimized CSS animations, lazy loading
- **Backend**: Rate limiting, compression, caching
- **Database**: Indexed queries, connection pooling

## 🔒 Notes

- Use HTTPS so session cookies can be `secure`.
- PHP `session_set_cookie_params` is configured with `HttpOnly` and `SameSite=Lax`.

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
