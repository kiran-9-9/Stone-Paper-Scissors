# Setup Guide - Rock Paper Scissors Game

Follow these steps to deploy the game from scratch with your own accounts.

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (choose **FREE M0 Sandbox**)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `your-username`
   - Password: `your-secure-password`
   - Save the password!
5. Whitelist IP Address:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
6. Get Connection String:
   - Go to "Database" → "Connect"
   - Click "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Add database name: Change `?` to `/rps-game?`

## Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com/)
2. Sign up or sign in
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `rock-paper-scissors-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd BACKEND && npm install`
   - **Start Command**: `cd BACKEND && npm start`
   - **Branch**: `main`
6. Add Environment Variables (click "Add Environment Variable"):
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = (paste your MongoDB connection string from Step 1)
   FRONTEND_URL = (leave empty for now, update after deploying frontend)
   ```
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your Render URL (e.g., `https://rock-paper-scissors-backend.onrender.com`)

## Step 3: Update Frontend with Backend URL

1. Open `FRONTEND/sps.js`
2. Find line 13:
   ```javascript
   this.backendUrl = 'https://your-backend-url.onrender.com';
   ```
3. Replace with your Render URL from Step 2:
   ```javascript
   this.backendUrl = 'https://rock-paper-scissors-backend.onrender.com';
   ```
4. Save the file
5. Commit and push to GitHub

## Step 4: Update Netlify Configuration

1. Open `netlify.toml`
2. Find line 25:
   ```
   connect-src 'self' https://your-backend-url.onrender.com;
   ```
3. Replace with your Render URL from Step 2:
   ```
   connect-src 'self' https://rock-paper-scissors-backend.onrender.com;
   ```
4. Save and commit

## Step 5: Deploy Frontend to Netlify

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up or sign in
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure:
   - **Branch to deploy**: `main`
   - **Base directory**: (leave empty)
   - **Build command**: (leave empty)
   - **Publish directory**: `FRONTEND`
6. Click "Deploy site"
7. Wait for deployment
8. Copy your Netlify URL (e.g., `https://your-app-name.netlify.app`)

## Step 6: Update Backend CORS Settings

1. Go back to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service
3. Go to "Environment" tab
4. Edit the `FRONTEND_URL` variable:
   - Update with your Netlify URL from Step 5
   - Save changes
5. Wait for automatic redeployment

## Step 7: Test Everything

1. Visit your Netlify URL
2. Test the following:
   - ✅ Click "Login" button (enter your name)
   - ✅ Play a game (Rock/Paper/Scissors)
   - ✅ Click "Save Score"
   - ✅ Click "Leaderboard" (check if it loads)
   - ✅ Click "Logout"

## Quick Reference

### URLs to Update

1. **Frontend** (`FRONTEND/sps.js` line 13):
   ```javascript
   this.backendUrl = 'YOUR-RENDER-URL';
   ```

2. **Netlify** (`netlify.toml` line 25):
   ```
   connect-src 'self' YOUR-RENDER-URL;
   ```

3. **Backend** (Render Environment Variables):
   ```
   FRONTEND_URL = YOUR-NETLIFY-URL
   ```

### Environment Variables

**Backend (Render):**
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `MONGODB_URI` = Your MongoDB connection string
- `FRONTEND_URL` = Your Netlify URL

**No environment variables needed for frontend!**

## Troubleshooting

### Backend Won't Start
- Check MongoDB connection string
- Verify all environment variables are set
- Check Render logs for errors

### CORS Errors
- Update `FRONTEND_URL` in Render environment variables
- Make sure it matches your Netlify URL exactly

### Frontend Can't Connect to Backend
- Check `this.backendUrl` in `sps.js`
- Check browser console for errors
- Verify backend is running on Render

### Leaderboard Not Loading
- Check if backend is running
- Check Render logs
- Verify MongoDB connection
- Check browser console for errors

## Cost Estimate

- **MongoDB Atlas**: FREE (M0 Sandbox)
- **Render**: FREE (with limitations, may go to sleep)
- **Netlify**: FREE

**Total: $0/month** ✅

---

**Need Help?**

1. Check the deployment logs in Render
2. Check browser console for errors
3. Verify all URLs are correctly configured
4. Make sure MongoDB IP whitelist includes `0.0.0.0/0`

