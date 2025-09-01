# 🚀 Regent Portal - Heroku Deployment Guide

## 📋 Prerequisites
- GitHub repository with your code
- Heroku CLI installed
- Node.js 18+ installed locally
- Heroku account

## 🔧 **Frontend Service Setup**

### **Step 1: Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### **Step 2: Login to Heroku**
```bash
heroku login
```

### **Step 3: Create Frontend App**
```bash
# Navigate to client directory
cd client

# Create Heroku app
heroku create regent-portal-frontend

# Set buildpack to static buildpack
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
```

### **Step 4: Configure Environment Variables**
```bash
# Set API URL (will be updated after backend deployment)
heroku config:set REACT_APP_API_URL=https://your-backend-app.herokuapp.com

# Set NODE_ENV
heroku config:set NODE_ENV=production
```

### **Step 5: Deploy Frontend**
```bash
# Add all files
git add .

# Commit changes
git commit -m "Configure frontend for Heroku deployment"

# Push to Heroku
git push heroku main

# Open the app
heroku open
```

## 🔧 **Backend Service Setup (Next Step)**

### **Step 1: Create Backend App**
```bash
# Navigate to server directory
cd ../server

# Create Heroku app
heroku create regent-portal-backend

# Set buildpack to Node.js
heroku buildpacks:set heroku/nodejs
```

### **Step 2: Configure Backend Environment**
```bash
# Set MongoDB URI
heroku config:set MONGO_URI=your_mongodb_atlas_connection_string

# Set NODE_ENV
heroku config:set NODE_ENV=production

# Set PORT
heroku config:set PORT=3000
```

### **Step 3: Deploy Backend**
```bash
# Add all files
git add .

# Commit changes
git commit -m "Configure backend for Heroku deployment"

# Push to Heroku
git push heroku main
```

## 🔄 **Update Frontend API URL**

After backend is deployed:
```bash
# Navigate back to client directory
cd ../client

# Update API URL with actual backend URL
heroku config:set REACT_APP_API_URL=https://regent-portal-backend.herokuapp.com

# Redeploy frontend
git push heroku main
```

## 📁 **Configuration Files Created**

### **Frontend Service**
- ✅ `client/static.json` - Static buildpack configuration
- ✅ `client/Procfile` - Heroku process definition
- ✅ `client/package.json` - Updated with Heroku scripts

### **Key Features**
- ✅ **Static File Serving** - Optimized for React SPA
- ✅ **Client-Side Routing** - Handles React Router paths
- ✅ **Security Headers** - HSTS, XSS protection, etc.
- ✅ **Asset Caching** - Long-term caching for static files
- ✅ **HTTPS Only** - Enforces secure connections

## 🚀 **Deployment Commands Summary**

### **Frontend Deployment**
```bash
cd client
heroku create regent-portal-frontend
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
heroku config:set REACT_APP_API_URL=https://your-backend-app.herokuapp.com
heroku config:set NODE_ENV=production
git push heroku main
```

### **Backend Deployment**
```bash
cd server
heroku create regent-portal-backend
heroku buildpacks:set heroku/nodejs
heroku config:set MONGO_URI=your_mongodb_connection_string
heroku config:set NODE_ENV=production
git push heroku main
```

## 🔍 **Post-Deployment Verification**

### **Frontend Tests**
- ✅ App loads without errors
- ✅ Navigation works correctly
- ✅ Static assets load properly
- ✅ HTTPS redirects work

### **Backend Tests**
- ✅ API endpoints respond
- ✅ Database connection works
- ✅ Authentication functions
- ✅ File uploads work

## 🛠️ **Troubleshooting**

### **Build Failures**
```bash
# Check build logs
heroku logs --tail

# Verify buildpack
heroku buildpacks

# Check environment variables
heroku config
```

### **Runtime Errors**
```bash
# View runtime logs
heroku logs --tail

# Check app status
heroku ps

# Restart app if needed
heroku restart
```

### **Common Issues**
- **Buildpack Mismatch**: Ensure correct buildpack for each service
- **Environment Variables**: Verify all required vars are set
- **Port Binding**: Backend should use `$PORT` environment variable
- **Static Files**: Frontend should serve from `dist` directory

## 📊 **Heroku vs Render Comparison**

### **Heroku Advantages**
- ✅ **Mature Platform** - 15+ years of reliability
- ✅ **Rich Ecosystem** - Add-ons, monitoring, logging
- ✅ **Easy Scaling** - Dyno scaling and auto-scaling
- ✅ **Git Integration** - Direct deployment from Git
- ✅ **Add-on Marketplace** - Database, monitoring, etc.

### **Render Advantages**
- ✅ **Simpler Setup** - Fewer configuration files
- ✅ **Free Tier** - More generous free offerings
- ✅ **Modern UI** - Cleaner dashboard interface
- ✅ **Auto-Deploy** - Automatic deployments on push

## 🎯 **Next Steps After Frontend Deployment**

1. **Test Frontend** - Verify it loads correctly
2. **Deploy Backend** - Set up the API service
3. **Update API URL** - Connect frontend to backend
4. **Test Integration** - Verify full functionality
5. **Set Up Monitoring** - Add logging and alerts
6. **Configure Domains** - Set up custom domains if needed

## 📞 **Support Resources**

- **Heroku Documentation**: [devcenter.heroku.com](https://devcenter.heroku.com/)
- **Static Buildpack**: [github.com/heroku/heroku-buildpack-static](https://github.com/heroku/heroku-buildpack-static)
- **Node.js Buildpack**: [github.com/heroku/heroku-buildpack-nodejs](https://github.com/heroku/heroku-buildpack-nodejs)

---

**🚀 Ready to deploy your frontend to Heroku!** 

Start with the frontend deployment, then we'll set up the backend service to complete the migration. 