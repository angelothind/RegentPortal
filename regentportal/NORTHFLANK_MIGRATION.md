# 🚀 Regent Portal - Migration from Render to Northflank

## 📋 Prerequisites
- GitHub repository with your code
- MongoDB Atlas cluster
- Northflank account
- Docker installed locally (for testing)

## 🔄 Migration Steps

### 1. **Prepare Your Local Environment**
```bash
# Test Docker builds locally
npm run build:backend
npm run build:frontend
```

### 2. **Set Up Northflank Account**
1. Go to [Northflank Dashboard](https://app.northflank.com/)
2. Create a new account or sign in
3. Create a new project: `regent-portal`

### 3. **Deploy Backend Service**
1. **Create Backend Service:**
   - Click "New Service" → "Web Service"
   - Connect your GitHub repository
   - Select branch: `main`
   - Choose "Custom Build" option

2. **Configure Backend Build:**
   - **Build Command**: `npm run build:backend`
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Port**: `3000`
   - **Health Check Path**: `/api/test`

3. **Set Environment Variables:**
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

4. **Deploy Backend:**
   - Click "Deploy"
   - Wait for build to complete
   - Note the backend URL (e.g., `https://backend-abc123.northflank.app`)

### 4. **Deploy Frontend Service**
1. **Create Frontend Service:**
   - Click "New Service" → "Web Service"
   - Connect your GitHub repository
   - Select branch: `main`
   - Choose "Custom Build" option

2. **Configure Frontend Build:**
   - **Build Command**: `npm run build:frontend`
   - **Dockerfile Path**: `Dockerfile.frontend`
   - **Port**: `80`
   - **Health Check Path**: `/`

3. **Set Environment Variables:**
   - `API_URL`: Your backend service URL (from step 3)

4. **Deploy Frontend:**
   - Click "Deploy"
   - Wait for build to complete
   - Note the frontend URL (e.g., `https://frontend-xyz789.northflank.app`)

### 5. **Update Frontend API Configuration**
1. **Update Environment Variable:**
   - In Northflank frontend service, set:
   - `REACT_APP_API_URL`: Your backend service URL

2. **Verify API Calls:**
   - Test login functionality
   - Verify test loading works
   - Check teacher view functionality

## 🔧 **Configuration Files Created**

### **Backend Service** (`northflank.yaml`)
- Node.js 18 Alpine image
- Port 3000
- Health checks
- Auto-scaling (1-3 replicas)
- Resource limits (0.5 CPU, 512MB RAM)

### **Frontend Service** (`northflank-frontend.yaml`)
- Nginx Alpine image
- Port 80
- Static file serving
- Client-side routing support
- Gzip compression
- Security headers

### **Docker Configuration**
- `Dockerfile.backend`: Multi-stage build for Node.js backend
- `Dockerfile.frontend`: Multi-stage build with Nginx
- `.dockerignore`: Excludes unnecessary files
- `nginx.conf`: Production-ready Nginx configuration

## 🚀 **Benefits of Northflank Migration**

### **Performance Improvements**
- ✅ **Faster Builds**: Docker layer caching
- ✅ **Better Scaling**: Auto-scaling based on CPU usage
- ✅ **Health Monitoring**: Built-in health checks
- ✅ **Resource Optimization**: Efficient resource allocation

### **Deployment Features**
- ✅ **Blue-Green Deployments**: Zero-downtime updates
- ✅ **Rollback Support**: Quick rollback to previous versions
- ✅ **Environment Management**: Separate dev/staging/prod
- ✅ **Git Integration**: Automatic deployments on push

### **Monitoring & Logging**
- ✅ **Real-time Logs**: Live log streaming
- ✅ **Metrics Dashboard**: CPU, memory, request metrics
- ✅ **Error Tracking**: Built-in error monitoring
- ✅ **Performance Insights**: Response time analysis

## 🔍 **Post-Migration Verification**

### 1. **Test All Functionality**
- ✅ User authentication (login/logout)
- ✅ Student dashboard
- ✅ Teacher dashboard
- ✅ Test taking (reading/listening)
- ✅ Test submission and grading
- ✅ Admin functions

### 2. **Check Performance**
- ✅ Page load times
- ✅ API response times
- ✅ File uploads (audio/images)
- ✅ Database queries

### 3. **Verify Environment Variables**
- ✅ `MONGO_URI` in backend
- ✅ `REACT_APP_API_URL` in frontend
- ✅ `NODE_ENV=production`

## 🛠️ **Troubleshooting**

### **Build Failures**
```bash
# Test locally first
npm run build:backend
npm run build:frontend

# Check Docker logs
docker logs <container-id>
```

### **Runtime Errors**
- Verify environment variables in Northflank
- Check MongoDB Atlas connection
- Review service logs in Northflank dashboard

### **Frontend Issues**
- Verify `REACT_APP_API_URL` is correct
- Check Nginx configuration
- Test static file serving

## 📞 **Support Resources**

- **Northflank Documentation**: [docs.northflank.com](https://docs.northflank.com/)
- **Docker Documentation**: [docs.docker.com](https://docs.docker.com/)
- **Nginx Documentation**: [nginx.org](https://nginx.org/en/docs/)

## 🎉 **Migration Complete!**

After successful migration, your Regent Portal will be running on Northflank with:
- **Backend**: `https://backend-xxx.northflank.app`
- **Frontend**: `https://frontend-xxx.northflank.app`
- **Auto-scaling** based on demand
- **Health monitoring** and logging
- **Zero-downtime deployments**

## 🔄 **Next Steps**

1. **Update DNS** (if using custom domain)
2. **Set up monitoring alerts**
3. **Configure backup strategies**
4. **Test disaster recovery procedures**
5. **Document new deployment process**

---

**⚠️ Important**: Remember to update your Render environment variables and consider decommissioning the old Render services after confirming Northflank is working correctly. 