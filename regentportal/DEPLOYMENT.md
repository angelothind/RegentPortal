# 🚀 Regent Portal - Render Deployment Guide

## 📋 Prerequisites
- GitHub repository with your code
- MongoDB Atlas cluster
- Render account

## 🔧 Render Deployment Steps

### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository: `regentportal`

### 2. Configure Build Settings
- **Name**: `regent-portal` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)

### 3. Build & Deploy Commands
- **Build Command**: `chmod +x render-build.sh && ./render-build.sh`
- **Start Command**: `cd server && npm start`

### 4. Environment Variables
Add these in Render dashboard:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/regentportal?retryWrites=true&w=majority
NODE_ENV=production
```

**⚠️ Important**: Replace the MONGO_URI with your actual MongoDB Atlas connection string!

### 5. Advanced Settings
- **Auto-Deploy**: Enable (recommended)
- **Health Check Path**: `/api/test` (optional)

## 🔍 Deployment Verification

### 1. Check Build Logs
- Monitor the build process in Render dashboard
- Ensure client builds successfully to `client/dist`
- Verify server dependencies install correctly

### 2. Test Endpoints
Once deployed, test these endpoints:
- **Health Check**: `https://your-app.onrender.com/api/test`
- **Frontend**: `https://your-app.onrender.com/`

### 3. Database Connection
- Verify MongoDB Atlas connection
- Check that tests load correctly
- Test user authentication

## 🛠️ Troubleshooting

### Build Failures
- Check Node.js version (requires 18+)
- Verify all dependencies are in package.json
- Check build script permissions

### Runtime Errors
- Check MongoDB Atlas connection string
- Verify environment variables are set
- Check server logs in Render dashboard

### Frontend Issues
- Ensure client/dist folder is created
- Check static file serving in server/app.js
- Verify proxy settings are removed for production

## 📁 Project Structure
```
regentportal/
├── client/                 # React frontend
│   ├── dist/              # Built frontend (created during build)
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── server.js          # Entry point
│   ├── app.js             # Express app
│   └── package.json       # Backend dependencies
├── package.json            # Root package.json for Render
├── render-build.sh         # Build script
└── DEPLOYMENT.md           # This file
```

## 🔒 Security Notes
- Never commit `.env` files to Git
- Use environment variables for sensitive data
- Ensure MongoDB Atlas has proper access controls
- Consider adding rate limiting for production

## 📞 Support
If you encounter issues:
1. Check Render build logs
2. Verify environment variables
3. Test locally with production settings
4. Check MongoDB Atlas connection

## 🎉 Success!
Once deployed, your Regent Portal will be accessible at:
`https://your-app-name.onrender.com`

The app will automatically rebuild and deploy when you push changes to your main branch. 