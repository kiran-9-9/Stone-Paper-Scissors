# Deployment Guide - Rock Paper Scissors Game

This guide will help you deploy the Rock Paper Scissors game to production.

## Architecture Overview

- **Frontend**: Deployed on Netlify
- **Backend**: Deployed on Render
- **Database**: MongoDB Atlas

## Prerequisites

1. Netlify account
2. Render account
3. MongoDB Atlas account
4. Git repository

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Render)
5. Get your connection string

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `rock-paper-scissors-backend`
   - **Environment**: Node
   - **Build Command**: `cd BACKEND && npm install`
   - **Start Command**: `cd BACKEND && npm start`
   - **Branch**: `main`

5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or any port Render provides)
   - `MONGODB_URI`: Your MongoDB connection string
   - `FRONTEND_URL`: Your Netlify URL (update after Step 3)

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy your Render URL (e.g., `https://stone-paper-scissors-48b2.onrender.com`)

## Step 3: Deploy Frontend to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure:
   - **Build command**: (leave empty or use `echo "No build needed"`)
   - **Publish directory**: `FRONTEND`
   - **Branch**: `main`

5. Click "Show advanced" and add environment variables:
   - `REACT_APP_API_URL`: Your Render backend URL

6. Click "Deploy site"
7. Wait for deployment to complete
8. Copy your Netlify URL (e.g., `https://stone-paper-siz.netlify.app`)

## Step 4: Update Backend CORS Settings

1. Go back to Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Netlify URL
3. Redeploy the backend service

## Step 5: Update Frontend with Backend URL

The backend URL is already configured in `FRONTEND/sps.js`:
```javascript
this.backendUrl = 'https://stone-paper-scissors-48b2.onrender.com';
```

If your backend URL is different, update this line before deploying.

## Step 6: Verify Deployment

1. Visit your Netlify URL
2. Test the game:
   - Click on Rock, Paper, or Scissors
   - See if the game works correctly
3. Test login:
   - Click "Login" button
   - Enter your player name
   - Click "Login"
4. Test save score:
   - Play a game
   - Click "Save Score"
   - See if it saves successfully
5. Test leaderboard:
   - Click "Leaderboard" button
   - See if leaderboard loads

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Check your MongoDB connection string
   - Ensure IP whitelist includes `0.0.0.0/0`
   - Check environment variables in Render

2. **CORS Errors**
   - Verify `FRONTEND_URL` in Render environment variables
   - Make sure it matches your Netlify URL exactly

3. **Build Errors**
   - Check build logs in Render
   - Ensure all dependencies are in package.json
   - Run `npm install` locally to verify dependencies

### Frontend Issues

1. **API Calls Fail**
   - Check browser console for errors
   - Verify backend URL in `FRONTEND/sps.js`
   - Check CORS settings in backend

2. **Styling Issues**
   - Hard refresh browser (Ctrl+Shift+R)
   - Check Netlify deployment logs
   - Verify all assets are committed to git

3. **Login/Logout Issues**
   - Clear browser localStorage
   - Check browser console for errors
   - Verify modals are working

## Environment Variables Summary

### Backend (Render)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rps-game?retryWrites=true&w=majority
FRONTEND_URL=https://your-app-name.netlify.app
```

### Frontend

Update in `FRONTEND/sps.js`:
```javascript
this.backendUrl = 'https://your-backend-url.onrender.com';
```

## Testing the Complete Flow

1. Open your Netlify URL
2. Login with a player name
3. Play several games
4. Save your score
5. Open leaderboard and verify your name appears
6. Logout and login with a different name
7. Play more games
8. Save score again
9. Check leaderboard for multiple players

## Security Notes

1. Never commit `.env` files to git
2. Use strong passwords for MongoDB
3. Enable IP restrictions in MongoDB Atlas
4. Use environment variables for all sensitive data
5. Regularly update dependencies

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review deployment logs
3. Check MongoDB Atlas logs
4. Verify all environment variables are set correctly
5. Test locally first before deploying

## Next Steps

After successful deployment:

1. Share your game with friends
2. Monitor usage in MongoDB Atlas
3. Check Render and Netlify analytics
4. Add custom domain (optional)
5. Set up automated deployments

---

**Happy Deploying! 🚀**

